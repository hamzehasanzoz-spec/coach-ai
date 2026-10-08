import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveQuestion } from "@/lib/server-fns";
import { toast } from "sonner";

const EMPTY = { text: "", options: ["", "", "", ""], correct_index: 0, explanation: "" };

export default function QuestionDialog({ open, onOpenChange, topicName, question, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      question
        ? {
            text: question.text ?? "",
            options: [0, 1, 2, 3].map((index) => question.options?.[index] ?? ""),
            correct_index: question.correct_index ?? 0,
            explanation: question.explanation ?? "",
          }
        : EMPTY
    );
  }, [open, question]);

  const valid = form.text.trim().length >= 5 && form.options.every((option) => option.trim().length > 0);

  async function save(event) {
    event.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    try {
      await saveQuestion({
        data: {
          id: question?.id,
          topic_name: topicName,
          text: form.text.trim(),
          options: form.options.map((option) => option.trim()),
          correct_index: Number(form.correct_index),
          explanation: form.explanation.trim(),
        },
      });
      await onSaved();
      onOpenChange(false);
      toast.success("تم حفظ السؤال في بنك الأسئلة.");
    } catch {
      toast.error("تعذّر حفظ السؤال.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{question ? "تعديل السؤال" : "إضافة سؤال جديد"}</DialogTitle>
          <DialogDescription>الموضوع: {topicName}</DialogDescription>
        </DialogHeader>

        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">نص السؤال الطبي</Label>
            <Textarea
              id="question-text"
              value={form.text}
              onChange={(event) => setForm({ ...form, text: event.target.value })}
              rows={3}
              placeholder="اكتب نص السؤال بنمط الامتحان الوطني الطبي..."
              className="rounded-xl border-border bg-background text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>خيارات الإجابة (MCQ)</Label>
            {form.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground">{index + 1}</span>
                <Input
                  value={option}
                  onChange={(event) => {
                    const options = [...form.options];
                    options[index] = event.target.value;
                    setForm({ ...form, options });
                  }}
                  placeholder={`الخيار ${index + 1}`}
                  className="h-10 rounded-xl border-border bg-background text-sm"
                />
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>حدد الإجابة الصحيحة</Label>
              <Select
                value={String(form.correct_index)}
                onValueChange={(value) => setForm({ ...form, correct_index: Number(value) })}
              >
                <SelectTrigger className="h-10 rounded-xl border-border bg-background text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {form.options.map((_, index) => (
                    <SelectItem key={index} value={String(index)}>
                      الخيار رقم ({index + 1})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-explanation">الشرح والتبرير الطبي</Label>
            <Textarea
              id="question-explanation"
              value={form.explanation}
              onChange={(event) => setForm({ ...form, explanation: event.target.value })}
              rows={3}
              placeholder="وضح سبب صحة الخيار واستبعاد باقي الخيارات..."
              className="rounded-xl border-border bg-background text-sm"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="submit" disabled={!valid || busy} className="rounded-xl">
              حفظ السؤال
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}