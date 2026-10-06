import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveMyProfile } from "@/lib/server-fns";

export default function StudyPreferences({ profile }) {
  const router = useRouter();
  const [university, setUniversity] = useState("");
  const [examDate, setExamDate] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUniversity(profile?.university ?? "");
    setExamDate(profile?.target_exam_date ?? "");
  }, [profile]);

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await saveMyProfile({ data: { university, target_exam_date: examDate } });
      await router.invalidate();
      toast.success("تم حفظ بياناتك الدراسية.");
    } catch {
      toast.error("تعذّر الحفظ. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel p-6">
      <h2 className="font-bold">تفضيلاتك الدراسية</h2>
      <p className="mt-1 text-sm text-muted-foreground">تظهر مدة العدّ التنازلي للامتحان في لوحة التحكم.</p>

      <form onSubmit={save} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="university">الجامعة أو الكلية</Label>
          <Input
            id="university"
            value={university}
            onChange={(event) => setUniversity(event.target.value)}
            placeholder="مثال: كلية الطب — جامعة دمشق"
            className="h-11 rounded-xl border-border bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-date">موعد الامتحان الوطني</Label>
          <Input
            id="exam-date"
            type="date"
            value={examDate}
            onChange={(event) => setExamDate(event.target.value)}
            className="h-11 rounded-xl border-border bg-background"
          />
        </div>

        <Button type="submit" disabled={busy} className="gap-2 rounded-xl">
          <Save className="h-4 w-4" aria-hidden="true" />
          حفظ التفضيلات
        </Button>
      </form>
    </section>
  );
}