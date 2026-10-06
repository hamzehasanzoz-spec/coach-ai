import { createFileRoute } from "@tanstack/react-router";
import { requireUserRoute } from "@/lib/auth-middleware";

// Agent tool for "coach_ai": returns the CALLING student's own uploaded study
// materials (as grounded excerpts) plus their questionnaire answers.
//
// The student is taken from the request token, never from the input, and every
// query is filtered by that student's id — so one student's files can never
// reach another student's conversation. Anonymous callers get 401.

const MAX_QUESTION = 600;
const MAX_FILES = 8;
const MAX_EXCERPTS = 8;
const MAX_EXCERPT_LENGTH = 1500;

const EXCERPT_SCHEMA = {
  type: "object",
  properties: {
    found: { type: "boolean" },
    excerpts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          material: { type: "string" },
          text: { type: "string" },
        },
        required: ["material", "text"],
      },
    },
  },
  required: ["found", "excerpts"],
};

const reply = (data) => Response.json(data, { headers: { "cache-control": "no-store" } });

export const Route = createFileRoute("/api/agent/study-context")({
  server: {
    middleware: [requireUserRoute],
    handlers: {
      POST: async ({ request, context }) => {
        const base44 = context.getBase44();
        const user = context.user;

        const body = await request.json().catch(() => ({}));
        const question = String(body?.question ?? "").slice(0, MAX_QUESTION).trim();

        const [profilePage, materialPage] = await Promise.all([
          base44.entities.StudentProfile.filter({ created_by_id: user.id }, { limit: 1 }),
          base44.entities.StudyMaterial.filter({ created_by_id: user.id }, { sort: "-created_date", limit: MAX_FILES }),
        ]);

        const profile = profilePage?.items?.[0] ?? null;
        const materials = materialPage?.items ?? [];

        const result = {
          student: {
            study_style: profile?.study_style ?? null,
            study_times: profile?.study_times ?? [],
            weak_subjects: profile?.weak_subjects ?? [],
            medical_background: profile?.medical_background ?? "",
            questionnaire_completed: profile?.questionnaire_completed === true,
          },
          materials: materials.map((material) => ({ name: material.name, type: material.file_type || "" })),
          found: false,
          excerpts: [],
        };

        if (!question || materials.length === 0) return reply(result);

        const core = base44.asServiceRole.integrations.Core;
        const files = [];
        for (const material of materials) {
          try {
            const { signed_url } = await core.CreateFileSignedUrl({ file_uri: material.file_uri, expires_in: 900 });
            if (signed_url) files.push({ name: material.name, url: signed_url });
          } catch {
            // A file that cannot be opened is skipped; the rest are still searched.
          }
        }
        if (files.length === 0) return reply(result);

        const extraction = await core.InvokeLLM({
          prompt: `أنت محرّك بحث دقيق داخل ملفات طالب طب. الملفات المرفقة هي الملفات التي رفعها الطالب نفسه.
طلب الطالب:
"${question}"

مهمتك: استخرج من الملفات المرفقة فقط المقاطع التي تجيب على طلب الطالب، منقولة كما هي (اقتباس حرفي) مع اسم الملف المصدر لكل مقطع.

قواعد صارمة:
- لا تستخدم أي معرفة من خارج الملفات المرفقة، ولا تُكمل أي معلومة ناقصة.
- إذا لم يوجد في الملفات ما يجيب على الطلب، اجعل found = false و excerpts = []، ولا تخترع أي معلومة أو اسم ملف.
- اجعل كل مقطع مختصراً (أقل من ٦ أسطر) وذا صلة مباشرة بالطلب.
- أعد النتيجة وفق الحقول المطلوبة فقط.`,
          file_urls: files.map((file) => file.url),
          response_json_schema: EXCERPT_SCHEMA,
        });

        const excerpts = Array.isArray(extraction?.excerpts) ? extraction.excerpts : [];
        result.found = extraction?.found === true && excerpts.length > 0;
        result.excerpts = excerpts.slice(0, MAX_EXCERPTS).map((excerpt) => ({
          material: String(excerpt?.material ?? ""),
          text: String(excerpt?.text ?? "").slice(0, MAX_EXCERPT_LENGTH),
        }));

        return reply(result);
      },
    },
  },
});