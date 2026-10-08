import { createFileRoute } from "@tanstack/react-router";
import { getMyStats, listConversations, listStudyPlan } from "@/lib/server-fns";
import StatGrid from "@/components/dashboard/StatGrid";
import ActivityChart from "@/components/dashboard/ActivityChart";
import StudyPlanPanel from "@/components/dashboard/StudyPlanPanel";
import RecentChats from "@/components/dashboard/RecentChats";

export const Route = createFileRoute("/_authed/dashboard")({
  loader: async () => {
    const [stats, plan, conversations] = await Promise.all([getMyStats(), listStudyPlan(), listConversations()]);
    return { stats, plan, conversations };
  },
  head: () => ({ meta: [{ title: "لوحة التحكم — كوتش AI" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { stats, plan, conversations } = Route.useLoaderData();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12" dir="rtl">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">لوحة التحكم</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">تقدّمك حتى الامتحان الوطني</h1>
      </header>

      <StatGrid stats={stats} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <ActivityChart daily={stats.daily} />
        <RecentChats conversations={conversations} />
      </div>

      <div className="mt-6">
        <StudyPlanPanel plan={plan} />
      </div>
    </div>
  );
}