import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatArabicDate } from "@/lib/labels";
import { createStudyPlanItem, deleteStudyPlanItem, setStudyPlanStatus } from "@/lib/server-fns";

export default function StudyPlanPanel({ plan }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);

  const done = plan.filter((item) => item.status === "done").length;
  const percent = plan.length ? Math.round((done / plan.length) * 100) : 0;

  async function addItem(event) {
    event.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await createStudyPlanItem({ data: { title, subject, due_date: dueDate } });
      setTitle("");
      setSubject("");
      setDueDate("");
      await router.invalidate();
    } catch {
      toast.error("تعذّر إضافة البند.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(item) {
    await setStudyPlanStatus({ data: { id: item.id, status: item.status === "done" ? "pending" : "done" } });
    await router.invalidate();
  }

  async function remove(id) {
    await deleteStudyPlanItem({ data: { id } });
    await router.invalidate();
  }

  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-bold">خطتي الدراسية</h2>
          <p className="mt-1 text-sm text-muted-foreground">وزّع المواد على أيامك وعلّم ما أنجزته.</p>
        </div>
        <div className="w-full max-w-56">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>الإنجاز</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
      </div>

      <form onSubmit={addItem} className="mt-6 grid gap-2 sm:grid-cols-[1.4fr_1fr_0.9fr_auto]">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="مثال: مراجعة فسيولوجيا القلب"
          className="h-11 rounded-xl border-border bg-background"
        />
        <Input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="المادة"
          className="h-11 rounded-xl border-border bg-background"
        />
        <Input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="h-11 rounded-xl border-border bg-background"
        />
        <Button type="submit" disabled={busy || !title.trim()} className="h-11 gap-2 rounded-xl">
          <Plus className="h-4 w-4" aria-hidden="true" />
          إضافة
        </Button>
      </form>

      <ul className="mt-6 space-y-2">
        {plan.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border px-5 py-6 text-center text-sm text-muted-foreground">
            لا توجد بنود بعد. أضف أول موضوع تريد مراجعته.
          </li>
        )}
        {plan.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <button
              type="button"
              onClick={() => toggle(item)}
              aria-label={item.status === "done" ? "إلغاء الإنجاز" : "تعليم كمنجز"}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                item.status === "done" ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {item.status === "done" && <ArrowLeft className="h-3 w-3 rotate-45" aria-hidden="true" />}
            </button>

            <div className="min-w-0 flex-1">
              <p className={cn("truncate font-medium", item.status === "done" && "text-muted-foreground line-through")}>
                {item.title}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {item.subject && <span>{item.subject}</span>}
                {item.due_date && (
                  <span className="flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" aria-hidden="true" />
                    {formatArabicDate(item.due_date, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </p>
            </div>

            <Button
              size="icon"
              variant="ghost"
              aria-label="حذف البند"
              onClick={() => remove(item.id)}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-3 text-sm">
        <Link to="/chat" className="font-medium text-primary hover:underline">
          ابدأ جلسة تدريب الآن
        </Link>
      </div>
    </section>
  );
}