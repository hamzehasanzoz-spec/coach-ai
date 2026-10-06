import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import Logo from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";

export default function SiteHeader() {
  const { isAuthenticated, navigateToLogin } = useAuth();
  // The session is resolved in the browser after hydration, so the server and the
  // first client render both show the signed-out actions — no hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const signedIn = mounted && isAuthenticated;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="كوتش AI">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            المزايا
          </a>
          <a href="#platform" className="transition-colors hover:text-foreground">
            المنصة
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <Button asChild size="sm" className="gap-2 rounded-full">
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                لوحة التحكم
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={navigateToLogin}>
                تسجيل الدخول
              </Button>
              <Button asChild size="sm" className="rounded-full">
                <Link to="/register">ابدأ مجاناً</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}