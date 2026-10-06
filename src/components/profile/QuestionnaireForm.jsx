import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ChoiceGroup from "@/components/profile/ChoiceGroup";
import SubjectTags from "@/components/profile/SubjectTags";
import { STUDY_STYLES, STUDY_TIMES } from "@/lib/labels";
import { saveMyProfile } from "@/lib/server-fns";

export default function QuestionnaireForm({ profile, onSaved }) {
  const [form, setForm] = useState({
    study_style: profile?.study_style ?? "",
    study_times: profile?.study_times ?? [],
    weak_subjects: profile?.weak_subjects ?? [],
    medical_background: profile?.medical_background ?? "",
  });
  const [busy, setBusy] = useState(false);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const pick = (field, value) => set(field, form[field] === value ? "" : value);
  const toggle = (field, value) =>
    set(
      field,
      form[field].includes(value) ? form[field].filter((item) => item !== value) : [...form[field], value],
    );

  async function submit(event) {
    event.preventDefault();
    if (!form.study_style) {
      toast.error("اختر أسلوب الدراسة الأقرب لك أولاً.");
      return;
    }
    setBusy(true);
    try {
      await saveMyProfile({ data: { ...form, questionnaire_completed: true } });
      toast.success("تم حفظ الاستبيان — سيستخدمه الكوتش في تخصيص دراستك.");
      await onSaved();
    } catch {
      toast.error("تعذّر الحفظ. حاول مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-7">
      <ChoiceGroup
        legend="كيف تتعلّم بأسرع؟"
        hint="اختر أسلوب الدراسة الأقرب لك."
        options={STUDY_STYLES}
        selected={form.study_style ? [form.study_style] : []}
        onSelect={(value) => pick("study_style", value)}
      />

      <ChoiceGroup
        legend="متى تحبّ الدراسة؟"
        hint="يمكنك اختيار أكثر من وقت."
        options={STUDY_TIMES}
        selected={form.study_times}
        onSelect={(value) => toggle("study_times", value)}
      />

      <div className="space-y-3">
        <Label>المواد التي تشعر أنها ضعيفة</Label>
        <p className="text-xs text-muted-foreground">
          أضف المواد أو المواضيع التي تحتاج تركيزاً أكبر، أو اختر من المقترحات.
        </p>
        <SubjectTags subjects={form.weak_subjects} onChange={(value) => set("weak_subjects", value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medical-background">خلفيتك الطبية باختصار</Label>
        <Textarea
          id="medical-background"
          value={form.medical_background}
          onChange={(event) => set("medical_background", event.target.value)}
          placeholder="مثال: طالب في السنة الرابعة بكلية الطب، أنهيت الباطنة وأدرس الجراحة حالياً."
          rows={4}
          className="rounded-2xl border-border bg-background"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
        <Button type="submit" disabled={busy} className="gap-2 rounded-xl">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          {busy ? "جارٍ الحفظ..." : "حفظ الاستبيان"}
        </Button>
        <p className="text-xs text-muted-foreground">يمكنك تعديل إجاباتك لاحقاً من صفحة البيانات.</p>
      </div>
    </form>
  );
}