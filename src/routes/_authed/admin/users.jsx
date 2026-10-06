import { createFileRoute } from "@tanstack/react-router";
import { listAppUsers } from "@/lib/server-fns";
import UsersPanel from "@/components/admin/UsersPanel";

export const Route = createFileRoute("/_authed/admin/users")({
  loader: () => listAppUsers(),
  component: UsersPage,
});

function UsersPage() {
  const users = Route.useLoaderData();
  return <UsersPanel users={users} />;
}