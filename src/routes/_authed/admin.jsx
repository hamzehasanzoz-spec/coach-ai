import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { BarChart3, BookOpen, Users } from "lucide-react";

const TABS = [
  { to: "/admin/users", label: "الطلاب", Icon: Users },
  { to: "/admin/content", label: "المحتوى الدراسي", Icon: BookOpen },
  { to: "/admin/usage", label: "الإحصاءات", Icon: BarChart3 },
];

export const Route = createFileRoute("/_authed/admin")({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== "admin") throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-6">
        <p className="text-sm font-medium text-primary">لوحة الإدارة</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">إدارة كوتش AI</h1>
      </header>

      <nav className="no-scrollbar mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-1.5">
        {TABS.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            activeProps={{ className: "bg-primary text-primary-foreground shadow-sm" }}
            className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      <Outlet />
    </div>
  );
}