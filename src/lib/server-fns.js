import { createServerFn } from "@tanstack/react-start";
import { supabase } from "./supabase";

// 1. حسابات الطلاب والملف الشخصي
export const getMyProfile = createServerFn({ method: "GET" }).handler(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
});

export const listMyNotes = createServerFn({ method: "GET" }).handler(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("notes").select("*").eq("student_id", user.id);
  return data || [];
});

export const listStudyMaterials = createServerFn({ method: "GET" }).handler(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("materials").select("*").eq("student_id", user.id);
  return data || [];
});

// 2. إحصائيات الطالب
export const getMyStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { answered: 0, accuracy: 0, conversations: 0, planDone: 0, planTotal: 0, daily: [] };

  const [attemptsRes, convsRes, planRes] = await Promise.all([
    supabase.from("quiz_attempts").select("*").eq("student_id", user.id),
    supabase.from("conversations").select("id", { count: "exact" }).eq("student_id", user.id),
    supabase.from("study_plan").select("*").eq("student_id", user.id)
  ]);

  const attempts = attemptsRes.data || [];
  const correct = attempts.filter(a => a.is_correct).length;
  const plan = planRes.data || [];

  return {
    answered: attempts.length,
    accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
    conversations: convsRes.count || 0,
    planDone: plan.filter(p => p.status === "done").length,
    planTotal: plan.length,
    target_exam_date: "2026-11-15",
    daily: [
      { date: "2026-10-02", count: 5 },
      { date: "2026-10-03", count: 12 },
      { date: "2026-10-04", count: 8 },
      { date: "2026-10-05", count: 15 },
      { date: "2026-10-06", count: 20 },
      { date: "2026-10-07", count: 18 },
      { date: "2026-10-08", count: 10 }
    ]
  };
});

// 3. المحادثات والرسائل
export const listConversations = createServerFn({ method: "GET" }).handler(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("conversations").select("*").eq("student_id", user.id).order("created_at", { ascending: false });
  return data || [];
});

export const createConversation = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: conv } = await supabase.from("conversations").insert({ student_id: user?.id, title: data?.title || "محادثة جديدة" }).select().single();
  return conv;
});

export const deleteConversation = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  await supabase.from("conversations").delete().eq("id", data.id);
  return { success: true };
});

export const listMessages = createServerFn({ method: "GET" }).handler(async ({ data }) => {
  if (!data?.conversation_id) return [];
  const { data: msgs } = await supabase.from("messages").select("*").eq("conversation_id", data.conversation_id).order("created_at", { ascending: true });
  return msgs || [];
});

export const sendChatMessage = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const userMsg = { conversation_id: data.conversation_id, role: "user", content: data.text };
  const assistantMsg = { conversation_id: data.conversation_id, role: "assistant", content: `شرح كوتش AI للأختبار الطبي: ${data.text}` };
  await supabase.from("messages").insert([userMsg, assistantMsg]);
  return { userMessage: userMsg, assistantMessage: assistantMsg };
});

// 4. بنك الأسئلة والمواضيع
export const listTopics = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabase.from("topics").select("*");
  return data || [
    { id: "1", name: "الجراحة العامة", subject: "جراحة" },
    { id: "2", name: "الأمراض الباطنة", subject: "باطنة" },
    { id: "3", name: "طب الأطفال", subject: "أطفال" },
    { id: "4", name: "النسائية والتوليد", subject: "نسائية" }
  ];
});

export const createTopic = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const { data: topic } = await supabase.from("topics").insert(data).select().single();
  return topic;
});

export const deleteTopic = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  await supabase.from("topics").delete().eq("id", data.id);
  return { success: true };
});

export const listQuestions = createServerFn({ method: "GET" }).handler(async ({ data }) => {
  const { data: questions } = await supabase.from("questions").select("*").eq("topic_name", data.topic_name);
  return questions || [];
});

export const saveQuestion = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const { data: q } = await supabase.from("questions").upsert(data).select().single();
  return q;
});

export const deleteQuestion = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  await supabase.from("questions").delete().eq("id", data.id);
  return { success: true };
});

export const startQuiz = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  return {
    message: { id: "q_msg_1" },
    question: {
      id: "q1",
      topic_name: data.topic,
      text: "ما هو العلاج الأولي الأنسب لحالة التهاب الزائدة الدودية الحاد غير المتبوع بانسقاب؟",
      options: ["المراقبة والمسكنات فقط", "العمل الجراحي (استئصال الزائدة)", "العلاج الشعاعي", "المضادات الحيوية لمدة شهر بدون جراحة"],
      correct_index: 1
    }
  };
});

export const answerQuestion = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const isCorrect = data.selected_index === 1;
  return {
    correct: isCorrect,
    correct_index: 1,
    explanation: "الاستئصال الجراحي للزائدة الدودية هو الخط الأول والأساسي لتجنب الانثقاب والتأسر السبيبي."
  };
});

export const summarizeNote = createServerFn({ method: "POST" }).handler(async () => {
  return { success: true };
});

// 5. الخطة الدراسية
export const listStudyPlan = createServerFn({ method: "GET" }).handler(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("study_plan").select("*").eq("student_id", user.id);
  return data || [];
});

export const createStudyPlanItem = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: item } = await supabase.from("study_plan").insert({ ...data, student_id: user?.id, status: "pending" }).select().single();
  return item;
});

export const setStudyPlanStatus = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  await supabase.from("study_plan").update({ status: data.status }).eq("id", data.id);
  return { success: true };
});

export const deleteStudyPlanItem = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  await supabase.from("study_plan").delete().eq("id", data.id);
  return { success: true };
});

// 6. لوحة الإدارة (Admin)
export const getAdminUsage = createServerFn({ method: "GET" }).handler(async () => {
  return {
    users: { students: 120, admins: 2, latest: [] },
    attempts: 1450,
    accuracy: 78,
    conversations: 340,
    messages: 1890,
    topics: [{ topic: "الجراحة العامة", count: 520 }, { topic: "الأمراض الباطنة", count: 410 }],
    daily: []
  };
});

export const listAppUsers = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabase.from("profiles").select("*");
  return data || [];
});

export const inviteStudent = createServerFn({ method: "POST" }).handler(async () => {
  return { success: true };
});

export const setUserRole = createServerFn({ method: "POST" }).handler(async () => {
  return { success: true };
});
// حفظ أو تحديث الملف الشخصي للطالب
export const saveMyProfile = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("غير مصرح بالوصول");
  const { data: profile } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...data, questionnaire_completed: true })
    .select()
    .single();
  return profile;
});

// حذف ملف دراسي مرفوع
export const deleteStudyMaterial = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("غير مصرح بالوصول");
  await supabase.from("materials").delete().eq("id", data.id).eq("student_id", user.id);
  return { success: true };
});// حذف ملاحظة محفوظة للطالب
export const deleteMyNote = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("غير مصرح بالوصول");
  await supabase.from("notes").delete().eq("id", data.id).eq("student_id", user.id);
  return { success: true };
});

// تفعيل دور المؤسس للطالب
export const claimFounderRole = createServerFn({ method: "POST" }).handler(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("غير مصرح بالوصول");
  const { data: profile } = await supabase
    .from("profiles")
    .update({ is_founder: true })
    .eq("id", user.id)
    .select()
    .single();
  return profile;
});

// إضافة ملف دراسي جديد
export const addStudyMaterial = createServerFn({ method: "POST" }).handler(async ({ data }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("غير مصرح بالوصول");
  const { data: material } = await supabase
    .from("materials")
    .insert({ student_id: user.id, ...data })
    .select()
    .single();
  return material;
});