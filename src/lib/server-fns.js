import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const asList = (res) => (Array.isArray(res) ? res : res?.items ?? []);

const forbid = (message) => {
  setResponseStatus(403);
  throw Object.assign(new Error(message), { status: 403 });
};

const adminOnly = (context) => {
  if (context.user?.role !== "admin") forbid("هذه العملية متاحة للمدير فقط");
};

async function ownedConversation(base44, id, user) {
  const conversation = await base44.entities.Conversation.get(id);
  if (conversation.created_by_id !== user.id && user.role !== "admin") forbid("غير مصرّح بالوصول إلى هذه المحادثة");
  return conversation;
}

async function ownedRecord(base44, entity, id, user) {
  const record = await base44.entities[entity].get(id);
  if (record.created_by_id !== user.id && user.role !== "admin") forbid("غير مصرّح بالوصول إلى هذا العنصر");
  return record;
}

const TUTOR = `أنت "كوتش AI"، مدرّب طبي خبير يرافق طلاب الطب في التحضير للامتحان الوطني.
قواعدك:
- أجب دائماً بالعربية الفصحى المبسطة وبتنظيم واضح: عناوين قصيرة، نقاط، وأمثلة سريرية.
- اشرح "لماذا" لا الحفظ فقط، وركّز على ما يكثر في الامتحان الوطني.
- اذكر الأخطاء الشائعة إذا وُجدت، واختم بسطر واحد للمراجعة السريعة.
- إن كان السؤال غامضاً اطلب توضيحاً بسؤال واحد قصير.
- اجعل الإجابة مركّزة (أقل من ٣٠٠ كلمة).`;

const textOf = (res) => (typeof res === "string" ? res : (res?.content ?? res?.text ?? ""));

const QUIZ_SCHEMA = {
  type: "object",
  properties: {
    text: { type: "string" },
    options: { type: "array", items: { type: "string" } },
    correct_index: { type: "integer" },
    explanation: { type: "string" },
  },
  required: ["text", "options", "correct_index", "explanation"],
};

const dayKey = (row, index) => row?.date ?? row?.day ?? row?.bucket ?? row?._id ?? `#${index}`;
const toDaily = (rows) =>
  asList(rows)
    .map((row, i) => ({ date: String(dayKey(row, i)), count: Number(row?.count ?? 0) }))
    .slice(-7);

const conversationTitle = (text) => (text.length > 60 ? `${text.slice(0, 60)}…` : text);

// ------------------------------------------------------------------ conversations

export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const page = await context
      .getBase44()
      .entities.Conversation.filter({ created_by_id: context.user.id }, { sort: "-updated_date", limit: 50 });
    return asList(page);
  });

export const createConversation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ title: z.string().max(140).optional() }))
  .handler(({ data, context }) =>
    context.getBase44().entities.Conversation.create({ title: data.title || "محادثة جديدة", mode: "explain" }),
  );

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    await ownedConversation(base44, data.id, context.user);
    await base44.entities.Message.deleteMany({ conversation_id: data.id });
    await base44.entities.Conversation.delete(data.id);
    return { ok: true };
  });

export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ conversation_id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const page = await context
      .getBase44()
      .entities.Message.filter({ conversation_id: data.conversation_id }, { sort: "created_date", limit: 200 });
    return asList(page);
  });

// ------------------------------------------------------------------ coach chat

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ conversation_id: z.string().min(1), text: z.string().min(1).max(4000) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const conversation = await ownedConversation(base44, data.conversation_id, context.user);

    const userMessage = await base44.entities.Message.create({
      conversation_id: conversation.id,
      role: "user",
      kind: "chat",
      content: data.text,
    });

    const history = asList(
      await base44.entities.Message.filter({ conversation_id: conversation.id }, { sort: "created_date", limit: 40 }),
    );
    const transcript = history
      .slice(-12)
      .map((m) => `${m.role === "user" ? "الطالب" : "المدرّب"}: ${m.content}`)
      .join("\n");

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${TUTOR}\n\nسجل المحادثة:\n${transcript}\n\nاكتب الآن ردّ المدرّب على آخر رسالة للطالب.`,
    });

    const assistantMessage = await base44.entities.Message.create({
      conversation_id: conversation.id,
      role: "assistant",
      kind: "chat",
      content: textOf(reply) || "لم أتمكن من توليد رد، حاول مرة أخرى.",
    });

    if (!conversation.title || conversation.title === "محادثة جديدة") {
      await base44.entities.Conversation.update(conversation.id, { title: conversationTitle(data.text) });
    }

    return { userMessage, assistantMessage };
  });

// ------------------------------------------------------------------ practice quiz

export const startQuiz = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ conversation_id: z.string().min(1), topic: z.string().min(2).max(120) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const conversation = await ownedConversation(base44, data.conversation_id, context.user);
    const topic = data.topic.trim();

    const pool = asList(
      await base44.entities.Question.filter({ topic_name: topic }, { limit: 60 }),
    );

    let question;
    if (pool.length) {
      question = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `أنت واضع أسئلة للامتحان الوطني الطبي. اكتب سؤالاً واحداً متعدد الخيارات بالعربية عن موضوع: "${topic}".
الشروط: أربعة خيارات دقيقة وواحد فقط صحيح، السؤال بمستوى الامتحان الوطني، والشرح يوضّح سبب صحة الإجابة الصحيحة وأشهر خطأ في الخيارات الأخرى.`,
        response_json_schema: QUIZ_SCHEMA,
      });
      const options = Array.isArray(generated?.options) ? generated.options.slice(0, 4) : [];
      question = await base44.entities.Question.create({
        topic_name: topic,
        text: String(generated?.text ?? `سؤال عن ${topic}`),
        options,
        correct_index: Math.min(Math.max(Number(generated?.correct_index ?? 0), 0), Math.max(options.length - 1, 0)),
        explanation: String(generated?.explanation ?? ""),
        source: "ai",
      });
    }

    const options = Array.isArray(question.options) ? question.options : [];
    const message = await base44.entities.Message.create({
      conversation_id: conversation.id,
      role: "assistant",
      kind: "quiz",
      content: `${question.text}\n\n${options.map((option, i) => `${i + 1}. ${option}`).join("\n")}`,
    });

    return {
      message,
      question: { id: question.id, topic_name: question.topic_name, text: question.text, options },
    };
  });

export const answerQuestion = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      conversation_id: z.string().min(1),
      question_id: z.string().min(1),
      selected_index: z.number().int().min(0).max(20),
    }),
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const conversation = await ownedConversation(base44, data.conversation_id, context.user);
    const question = await base44.entities.Question.get(data.question_id);
    const options = Array.isArray(question.options) ? question.options : [];
    const correctIndex = Number(question.correct_index ?? 0);
    const correct = data.selected_index === correctIndex;

    await base44.entities.QuizAttempt.create({
      topic: question.topic_name || "عام",
      question: question.text,
      correct,
      source: question.source || "bank",
    });

    const chosen = options[data.selected_index] ?? `الخيار ${data.selected_index + 1}`;
    await base44.entities.Message.create({
      conversation_id: conversation.id,
      role: "user",
      kind: "quiz",
      content: `أجبت: ${chosen}`,
    });

    const feedback = correct
      ? `✅ **إجابة صحيحة.**\n\n${question.explanation ?? ""}`
      : `❌ **إجابة غير صحيحة.** الإجابة الصحيحة هي: **${options[correctIndex] ?? "—"}**\n\n${question.explanation ?? ""}`;

    const message = await base44.entities.Message.create({
      conversation_id: conversation.id,
      role: "assistant",
      kind: "chat",
      content: feedback,
    });

    return { correct, correct_index: correctIndex, explanation: question.explanation ?? "", message };
  });

// ------------------------------------------------------------------ notes

export const summarizeNote = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      conversation_id: z.string().min(1),
      file_uri: z.string().min(1).max(1000),
      signed_url: z.string().min(1).max(2000),
      title: z.string().min(1).max(160),
    }),
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const conversation = await ownedConversation(base44, data.conversation_id, context.user);

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `أنت مدرّب لطلاب الطب. اقرأ الملف المرفق (ملاحظات/محاضرة) ولخّصه لطالب يحضّر للامتحان الوطني.
اكتب بالعربية: ملخّصاً مركّزاً من ٤ إلى ٦ أسطر، ثم قائمة بأهم النقاط التي يجب حفظها، ثم سطراً أخيراً بعنوان "أسئلة محتملة" يحتوي سؤالين قصيرين.`,
      file_urls: [data.signed_url],
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          likely_questions: { type: "array", items: { type: "string" } },
        },
        required: ["summary", "key_points"],
      },
    });

    const summary = String(result?.summary ?? "");
    const keyPoints = Array.isArray(result?.key_points) ? result.key_points.map(String) : [];
    const likelyQuestions = Array.isArray(result?.likely_questions) ? result.likely_questions.map(String) : [];

    const note = await base44.entities.StudyNote.create({
      title: data.title,
      file_uri: data.file_uri,
      summary,
      key_points: keyPoints,
    });

    const content = [
      `📄 **${data.title}**`,
      "",
      summary,
      keyPoints.length ? `\n**أهم النقاط:**\n${keyPoints.map((point) => `• ${point}`).join("\n")}` : "",
      likelyQuestions.length ? `\n**أسئلة محتملة:**\n${likelyQuestions.map((q) => `• ${q}`).join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const message = await base44.entities.Message.create({
      conversation_id: conversation.id,
      role: "assistant",
      kind: "note",
      content,
    });

    await base44.entities.Message.create({
      conversation_id: conversation.id,
      role: "user",
      kind: "note",
      content: `راجع ملاحظاتي: ${data.title}`,
    });

    return { note, message };
  });

export const listMyNotes = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const page = await context
      .getBase44()
      .entities.StudyNote.filter({ created_by_id: context.user.id }, { sort: "-created_date", limit: 50 });
    return asList(page);
  });

export const deleteMyNote = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    await ownedRecord(base44, "StudyNote", data.id, context.user);
    await base44.entities.StudyNote.delete(data.id);
    return { ok: true };
  });

// ------------------------------------------------------------------ study plan

export const listStudyPlan = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const page = await context
      .getBase44()
      .entities.StudyPlanItem.filter({ created_by_id: context.user.id }, { sort: "due_date", limit: 100 });
    return asList(page);
  });

export const createStudyPlanItem = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      title: z.string().min(1).max(160),
      subject: z.string().max(80).optional(),
      due_date: z.string().max(20).optional(),
    }),
  )
  .handler(({ data, context }) =>
    context.getBase44().entities.StudyPlanItem.create({
      title: data.title,
      subject: data.subject ?? "",
      due_date: data.due_date || undefined,
      status: "pending",
    }),
  );

export const setStudyPlanStatus = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1), status: z.enum(["pending", "done"]) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    await ownedRecord(base44, "StudyPlanItem", data.id, context.user);
    return base44.entities.StudyPlanItem.update(data.id, { status: data.status });
  });

export const deleteStudyPlanItem = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    await ownedRecord(base44, "StudyPlanItem", data.id, context.user);
    await base44.entities.StudyPlanItem.delete(data.id);
    return { ok: true };
  });

// ------------------------------------------------------------------ progress

export const getMyStats = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    const uid = context.user.id;

    const [byCorrect, byStatus, dailyRows, conversationCount, profilePage] = await Promise.all([
      base44.entities.QuizAttempt.aggregate({ query: { created_by_id: uid }, groupBy: "correct" }),
      base44.entities.StudyPlanItem.aggregate({ query: { created_by_id: uid }, groupBy: "status" }),
      base44.entities.QuizAttempt.aggregate({
        query: { created_by_id: uid },
        dateBucket: { field: "created_date", unit: "day" },
        limit: 30,
      }),
      base44.entities.Conversation.count({ created_by_id: uid }),
      base44.entities.StudentProfile.filter({ created_by_id: uid }, { limit: 1 }),
    ]);

    const attemptRows = asList(byCorrect?.rows ?? byCorrect);
    const correct = Number(attemptRows.find((row) => row.correct === true)?.count ?? 0);
    const wrong = Number(attemptRows.find((row) => row.correct === false)?.count ?? 0);
    const answered = correct + wrong;

    const planRows = asList(byStatus?.rows ?? byStatus);
    const planDone = Number(planRows.find((row) => row.status === "done")?.count ?? 0);
    const planPending = Number(planRows.find((row) => row.status === "pending")?.count ?? 0);

    return {
      answered,
      correct,
      wrong,
      accuracy: answered ? Math.round((correct / answered) * 100) : 0,
      conversations: Number(conversationCount ?? 0),
      planDone,
      planTotal: planDone + planPending,
      daily: toDaily(dailyRows?.rows ?? dailyRows),
      target_exam_date: asList(profilePage)[0]?.target_exam_date ?? null,
    };
  });

// ------------------------------------------------------------------ profile

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const page = await context
      .getBase44()
      .entities.StudentProfile.filter({ created_by_id: context.user.id }, { limit: 1 });
    return {
      user: {
        full_name: context.user.full_name,
        email: context.user.email,
        role: context.user.role,
        created_date: context.user.created_date,
      },
      profile: asList(page)[0] ?? null,
    };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      university: z.string().max(160).optional(),
      target_exam_date: z.string().max(20).optional(),
      study_style: z.enum(["visual", "auditory", "reading", "kinesthetic"]).optional(),
      study_times: z.array(z.string().max(40)).max(10).optional(),
      weak_subjects: z.array(z.string().max(80)).max(30).optional(),
      medical_background: z.string().max(1200).optional(),
      questionnaire_completed: z.boolean().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const page = await base44.entities.StudentProfile.filter({ created_by_id: context.user.id }, { limit: 1 });
    const existing = asList(page)[0];
    // Only the fields the caller sent are written, so the preferences form and the
    // questionnaire can each save their own part of the profile.
    const patch = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

    if (existing) {
      if (Object.keys(patch).length === 0) return existing;
      return base44.entities.StudentProfile.update(existing.id, patch);
    }

    return base44.entities.StudentProfile.create({
      university: "",
      target_exam_date: "",
      study_times: [],
      weak_subjects: [],
      medical_background: "",
      questionnaire_completed: false,
      ...patch,
    });
  });

// ------------------------------------------------------------------ study materials

export const listStudyMaterials = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const page = await context
      .getBase44()
      .entities.StudyMaterial.filter({ created_by_id: context.user.id }, { sort: "-created_date", limit: 100 });
    return asList(page);
  });

export const addStudyMaterial = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      name: z.string().min(1).max(200),
      file_uri: z.string().min(1).max(1000),
      file_type: z.string().max(20).optional(),
      size: z.number().nonnegative().max(100000000).optional(),
    }),
  )
  .handler(({ data, context }) =>
    context.getBase44().entities.StudyMaterial.create({
      name: data.name,
      file_uri: data.file_uri,
      file_type: data.file_type ?? "",
      size: data.size ?? 0,
    }),
  );

export const deleteStudyMaterial = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    await ownedRecord(base44, "StudyMaterial", data.id, context.user);
    await base44.entities.StudyMaterial.delete(data.id);
    return { ok: true };
  });

// ------------------------------------------------------------------ study content

export const listTopics = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const page = await context.getBase44().entities.Topic.filter({}, { sort: "name", limit: 200 });
  return asList(page);
});

export const createTopic = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      name: z.string().min(2).max(120),
      subject: z.string().max(80).optional(),
      description: z.string().max(400).optional(),
    }),
  )
  .handler(({ data, context }) => {
    adminOnly(context);
    return context.getBase44().entities.Topic.create({
      name: data.name,
      subject: data.subject ?? "",
      description: data.description ?? "",
    });
  });

export const updateTopic = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().min(1),
      name: z.string().min(2).max(120),
      subject: z.string().max(80).optional(),
      description: z.string().max(400).optional(),
    }),
  )
  .handler(({ data, context }) => {
    adminOnly(context);
    return context.getBase44().entities.Topic.update(data.id, {
      name: data.name,
      subject: data.subject ?? "",
      description: data.description ?? "",
    });
  });

export const deleteTopic = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    adminOnly(context);
    const base44 = context.getBase44();
    const topic = await base44.entities.Topic.get(data.id);
    await base44.entities.Question.deleteMany({ topic_name: topic.name, source: "bank" });
    await base44.entities.Topic.delete(data.id);
    return { ok: true };
  });

export const listQuestions = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({ topic_name: z.string().min(1).max(120) }))
  .handler(async ({ data, context }) => {
    adminOnly(context);
    const page = await context
      .getBase44()
      .entities.Question.filter({ topic_name: data.topic_name, source: "bank" }, { sort: "-created_date", limit: 200 });
    return asList(page);
  });

export const saveQuestion = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      id: z.string().optional(),
      topic_name: z.string().min(1).max(120),
      text: z.string().min(5).max(1200),
      options: z.array(z.string().min(1).max(300)).min(2).max(6),
      correct_index: z.number().int().min(0).max(5),
      explanation: z.string().max(1200).optional(),
    }),
  )
  .handler(({ data, context }) => {
    adminOnly(context);
    const base44 = context.getBase44();
    const payload = {
      topic_name: data.topic_name,
      text: data.text,
      options: data.options,
      correct_index: data.correct_index,
      explanation: data.explanation ?? "",
      source: "bank",
    };
    return data.id
      ? base44.entities.Question.update(data.id, payload)
      : base44.entities.Question.create(payload);
  });

export const deleteQuestion = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    adminOnly(context);
    await context.getBase44().entities.Question.delete(data.id);
    return { ok: true };
  });

// ------------------------------------------------------------------ administration

export const listAppUsers = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    adminOnly(context);
    const users = asList(await context.getBase44().entities.User.list());
    return users
      .map((user) => ({
        id: user.id,
        full_name: user.full_name ?? "",
        email: user.email ?? "",
        role: user.role ?? "user",
        created_date: user.created_date ?? null,
      }))
      .sort((a, b) => new Date(a.created_date ?? 0) - new Date(b.created_date ?? 0));
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ user_id: z.string().min(1), role: z.enum(["user", "admin"]) }))
  .handler(async ({ data, context }) => {
    adminOnly(context);
    if (data.user_id === context.user.id && data.role === "user") {
      setResponseStatus(400);
      throw Object.assign(new Error("لا يمكنك إزالة صلاحية المدير عن نفسك"), { status: 400 });
    }
    await context.getBase44().asServiceRole.entities.User.update(data.user_id, { role: data.role });
    return { ok: true };
  });

export const inviteStudent = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ email: z.string().min(5).max(160), role: z.enum(["user", "admin"]) }))
  .handler(async ({ data, context }) => {
    adminOnly(context);
    await context.getBase44().users.inviteUser(data.email, data.role);
    return { ok: true };
  });

export const getAdminUsage = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    adminOnly(context);
    const base44 = context.getBase44();

    const [users, attempts, byCorrect, byTopic, conversations, messages, dailyRows, planItems] = await Promise.all([
      asList(await base44.entities.User.list()),
      base44.entities.QuizAttempt.count({}),
      base44.entities.QuizAttempt.aggregate({ groupBy: "correct" }),
      base44.entities.QuizAttempt.aggregate({ groupBy: "topic" }),
      base44.entities.Conversation.count({}),
      base44.entities.Message.count({}),
      base44.entities.QuizAttempt.aggregate({
        dateBucket: { field: "created_date", unit: "day" },
        limit: 30,
      }),
      base44.entities.StudyPlanItem.count({ status: "done" }),
    ]);

    const attemptRows = asList(byCorrect?.rows ?? byCorrect);
    const correct = Number(attemptRows.find((row) => row.correct === true)?.count ?? 0);
    const total = Number(attempts ?? 0);

    const topics = asList(byTopic?.rows ?? byTopic)
      .map((row) => ({ topic: String(row.topic ?? "عام"), count: Number(row.count ?? 0) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      users: {
        total: users.length,
        admins: users.filter((user) => user.role === "admin").length,
        students: users.filter((user) => user.role !== "admin").length,
        latest: users
          .slice()
          .sort((a, b) => new Date(b.created_date ?? 0) - new Date(a.created_date ?? 0))
          .slice(0, 5)
          .map((user) => ({
            full_name: user.full_name ?? "—",
            email: user.email ?? "",
            created_date: user.created_date ?? null,
          })),
      },
      attempts: total,
      accuracy: total ? Math.round((correct / total) * 100) : 0,
      conversations: Number(conversations ?? 0),
      messages: Number(messages ?? 0),
      planDone: Number(planItems ?? 0),
      topics,
      daily: toDaily(dailyRows?.rows ?? dailyRows),
    };
  });

export const claimFounderRole = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    if (context.user.role === "admin") return { promoted: false };
    const client = context.getBase44().asServiceRole;
    const users = asList(await client.entities.User.list());
    if (users.some((user) => user.role === "admin")) return { promoted: false };
    const founder = users
      .slice()
      .sort((a, b) => new Date(a.created_date ?? 0) - new Date(b.created_date ?? 0))[0];
    if (!founder || founder.id !== context.user.id) return { promoted: false };
    await client.entities.User.update(founder.id, { role: "admin" });
    return { promoted: true };
  });