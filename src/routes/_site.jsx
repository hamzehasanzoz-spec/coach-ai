import { Outlet, createFileRoute } from "@tanstack/react-router";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/_site")({ component: SiteLayout });

function SiteLayout() {
  return (
    <div className="hero-wash flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}