import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import useFounderRole from "@/hooks/use-founder-role";
import { roleLabel } from "@/lib/labels";

const LINKS = [
  { to: "/dashboard", label: "لوحة التحكم" },
  { to: "/chat", label: "الدردشة" },
  { to: "/profile", label: "البيانات" },
];

function NavLinks({ className = "" }) {
  const { user } = useAuth();
  const links = user?.role === "admin" ? [...LINKS, { to: "/admin/users", label: "الإدارة" }] : LINKS;

  return (
    <nav className={`flex items-center gap-1 ${className}`}>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          activeProps={{ className: "bg-secondary text-primary" }}
          className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default function AppNav() {
  const { user, logout } = useAuth();
  useFounderRole();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/dashboard" aria-label="كوتش AI">
          <Logo />
        </Link>

        <NavLinks className="hidden md:flex" />

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-end sm:block">
            <p className="text-sm font-semibold leading-tight">{user?.full_name || "طالب"}</p>
            <p className="text-xs text-muted-foreground">{roleLabel(user?.role)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={logout}
            aria-label="تسجيل الخروج"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <NavLinks className="no-scrollbar overflow-x-auto border-t border-border px-4 py-2 md:hidden" />
    </header>
  );
}