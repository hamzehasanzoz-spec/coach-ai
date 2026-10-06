import { createFileRoute } from "@tanstack/react-router";
import { getMyProfile, listMyNotes } from "@/lib/server-fns";
import ProfileIdentity from "@/components/profile/ProfileIdentity";
import StudyPreferences from "@/components/profile/StudyPreferences";
import SavedNotes from "@/components/profile/SavedNotes";

export const Route = createFileRoute("/_authed/profile")({
  loader: async () => {
    const [account, notes] = await Promise.all([getMyProfile(), listMyNotes()]);
    return { account, notes };
  },
  head: () => ({ meta: [{ title: "البيانات — كوتش AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { account, notes } = Route.useLoaderData();
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">البيانات</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">ملفك الدراسي</h1>
        <p className="mt-2 text-muted-foreground">بياناتك، تفضيلاتك، والملاحظات التي لخّصها الكوتش.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileIdentity account={account} />
        <StudyPreferences profile={account.profile} />
      </div>

      <div className="mt-6">
        <SavedNotes notes={notes} />
      </div>
    </div>
  );
}