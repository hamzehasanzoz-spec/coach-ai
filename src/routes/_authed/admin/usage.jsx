import { createFileRoute } from "@tanstack/react-router";
import { getAdminUsage } from "@/lib/server-fns";
import UsagePanel from "@/components/admin/UsagePanel";

export const Route = createFileRoute("/_authed/admin/usage")({
  loader: () => getAdminUsage(),
  component: UsagePage,
});

function UsagePage() {
  const usage = Route.useLoaderData();
  return <UsagePanel usage={usage} />;
}