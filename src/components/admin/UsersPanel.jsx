import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { ShieldCheck, ShieldMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/AuthContext";
import { formatArabicDate, roleLabel } from "@/lib/labels";
import { inviteStudent, setUserRole } from "@/lib/server-fns";

export default function UsersPanel({ users }) {
  const router = useRouter();
  const { user: me } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [busy, setBusy] = useState(false);

  async function invite(event) {
    event.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    try {
      await inviteStudent({ data: { email, role } });
      setEmail("");
      await router.invalidate();
      toast.success("تم إرسال الدعوة.");
    } catch {
      toast.error("تعذّر إرسال الدعوة. تأكد من صحة البريد.");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(target, nextRole) {
    try {
      await setUserRole({ data: { user_id: target.id, role: nextRole } });
      await router.invalidate();
      toast.success(nextRole === "admin" ? "تمت الترقية إلى مدير." : "تم تحويل الحساب إلى طالب.");
    } catch (error) {
      toast.error(error?.message ?? "تعذّر تحديث الصلاحية.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h2 className="font-bold">دعوة طالب جديد</h2>
        <p className="mt-1 text-sm text-muted-foreground">سيصل المستخدم بريد دعوة لإكمال إنشاء حسابه.</p>

        <form onSubmit={invite} className="mt-5 flex flex-wrap items-center gap-2">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="student@example.com"
            dir="ltr"
            className="h-11 min-w-56 flex-1 rounded-xl border-border bg-background"
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-11 w-32 rounded-xl border-border bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">طالب</SelectItem>
              <SelectItem value="admin">مدير</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={busy || !email.trim()} className="h-11 gap-2 rounded-xl">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            إرسال الدعوة
          </Button>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border p-6">
          <div>
            <h2 className="font-bold">المستخدمون</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {users.length} حساباً — {users.filter((item) => item.role === "admin").length} مدير.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">الاسم</TableHead>
                <TableHead className="text-start">البريد</TableHead>
                <TableHead className="text-start">الصلاحية</TableHead>
                <TableHead className="text-start">تاريخ الانضمام</TableHead>
                <TableHead className="text-start">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.full_name || "—"}
                    {item.id === me?.id && <span className="ms-2 text-xs text-muted-foreground">(أنت)</span>}
                  </TableCell>
                  <TableCell dir="ltr" className="text-start text-muted-foreground">
                    {item.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.role === "admin" ? "default" : "secondary"} className="rounded-full">
                      {roleLabel(item.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatArabicDate(item.created_date)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-full text-primary"
                      onClick={() => changeRole(item, item.role === "admin" ? "user" : "admin")}
                    >
                      {item.role === "admin" ? (
                        <>
                          <ShieldMinus className="h-4 w-4" aria-hidden="true" />
                          إزالة الإدارة
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                          ترقية إلى مدير
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}