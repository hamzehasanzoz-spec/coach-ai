import { Link } from "@tanstack/react-router";
import { AlertTriangle, Lock } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError, SubmitButton } from "@/components/auth/parts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// The /reset-password page; the reset email links here with ?token=.
export function ResetPasswordPage() {
  // Read raw: the router's search parser would turn an all-digit token into a number.
  const token = new URLSearchParams(window.location.search).get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setBusy(true);
    try {
      await base44.auth.resetPassword({ resetToken: token, newPassword: password });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "تعذّر تعيين كلمة المرور");
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="رابط غير صالح"
        subtitle="رابط إعادة التعيين مفقود أو غير صحيح"
        footer={
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            اطلب رابطاً جديداً
          </Link>
        }
      >
        <p className="text-center text-sm text-foreground">
          يبدو أن الرابط الذي استخدمته غير مكتمل. اطلب رسالة إعادة تعيين جديدة.
        </p>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout icon={Lock} title="كلمة مرور جديدة" subtitle="أدخل كلمة المرور الجديدة أدناه">
      <AuthError>{error}</AuthError>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-password">كلمة المرور الجديدة</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="reset-password" type="password" autoComplete="new-password" autoFocus placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pr-10" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-confirm">تأكيد كلمة المرور</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="reset-confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-12 pr-10" required />
          </div>
        </div>
        <SubmitButton busy={busy} busyLabel="جاري الحفظ...">
          تعيين كلمة المرور
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}