import { LogOut, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import { formatArabicDate, roleLabel } from "@/lib/labels";

export default function ProfileIdentity({ account }) {
  const { logout } = useAuth();
  const { user } = account;
  const initial = (user.full_name || user.email || "ط").trim().charAt(0);

  return (
    <section className="panel p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground">
          {initial}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{user.full_name || "طالب"}</h2>
          <Badge variant="secondary" className="mt-1 gap-1 rounded-full text-primary">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            {roleLabel(user.role)}
          </Badge>
        </div>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
          <dt className="text-muted-foreground">البريد الإلكتروني</dt>
          <dd className="truncate font-medium" dir="ltr">
            {user.email}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
          <dt className="text-muted-foreground">الصلاحية</dt>
          <dd className="font-medium">{roleLabel(user.role)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">تاريخ الانضمام</dt>
          <dd className="font-medium">{formatArabicDate(user.created_date)}</dd>
        </div>
      </dl>

      <Button variant="outline" onClick={logout} className="mt-6 w-full gap-2 rounded-xl">
        <LogOut className="h-4 w-4" aria-hidden="true" />
        تسجيل الخروج
      </Button>
    </section>
  );
}