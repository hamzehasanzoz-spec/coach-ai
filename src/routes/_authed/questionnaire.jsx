import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import QuestionnaireForm from "@/components/profile/QuestionnaireForm";
import { getMyProfile } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed/questionnaire")({
  validateSearch: (search) => ({ next: typeof search.next === "string" ? search.next : undefined }),
  loader: () => getMyProfile(),
  head: () => ({ meta: [{ title: "الاستبيان — كوتش AI" }] }),
  component: QuestionnairePage,
});

function QuestionnairePage() {
  const { profile } = Route.useLoaderData();
  const { next } = Route.useSearch();
  const router = useRouter();
  const navigate = useNavigate();
  const firstTime = profile?.questionnaire_completed !== true;

  async function afterSave() {
    await router.invalidate();
    await navigate({ to: next ?? "/dashboard" });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">الاستبيان</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {firstTime ? "أهلاً بك في كوتش AI" : "الاستبيان الدراسي"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {firstTime
            ? "أجب عن هذه الأسئلة السريعة ليعرف الكوتش كيف يشرح لك ويختبرك. يمكنك تعديل الإجابات لاحقاً من صفحة البيانات."
            : "حدّث إجاباتك، وسيستخدم الكوتش النسخة الأحدث في الشرح والأسئلة والخطة الدراسية."}
        </p>
      </header>

      <div className="panel p-6 sm:p-8">
        <QuestionnaireForm profile={profile} onSaved={afterSave} />
      </div>
    </div>
  );
}