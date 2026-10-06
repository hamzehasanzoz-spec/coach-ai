import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";
import AppNav from "@/components/layout/AppNav";
import { getMyProfile } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    const session = await requireSignedIn({ context, location });

    // A student's first entry into the app opens the study questionnaire once.
    if (session.user.role !== "admin" && location.pathname !== "/questionnaire") {
      const { profile } = await getMyProfile();
      if (profile?.questionnaire_completed !== true) throw redirect({ to: "/questionnaire" });
    }

    return session;
  },
  errorComponent: AuthGateError,
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}