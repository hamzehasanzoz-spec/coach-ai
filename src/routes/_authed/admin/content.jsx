import { createFileRoute } from "@tanstack/react-router";
import { listTopics } from "@/lib/server-fns";
import ContentManager from "@/components/admin/ContentManager";

export const Route = createFileRoute("/_authed/admin/content")({
  loader: () => listTopics(),
  component: ContentPage,
});

function ContentPage() {
  const topics = Route.useLoaderData();
  return <ContentManager topics={topics} />;
}