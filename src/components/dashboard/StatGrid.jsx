import { CalendarClock, ListChecks, MessagesSquare, Target } from "lucide-react";
import { daysUntil } from "@/lib/labels";

export default function StatGrid({ stats }) {
  const remaining = daysUntil(stats.target_exam_date);

  const items = [
    { label: "أسئلة محلولة", value: stats.answered, Icon: ListChecks },
    { label: "نسبة الإجابات الصحيحة", value: `${stats.accuracy}%`, Icon: Target },
    { label: "محادثات مع الكوتش", value: stats.conversations, Icon: MessagesSquare },
    { label: "بنود الخطة المنجزة", value: `${stats.planDone}/${stats.planTotal}`, Icon: CalendarClock },
  ];

  return (
    <div className="space-y-4">
      {remaining !== null && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-primary/15 bg-accent px-5 py-3 text-sm">
          <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="font-semibold text-primary">موعد الامتحان</span>
          <span className="text-muted-foreground">
            {remaining > 0
              ? `بقي ${remaining} يوماً — ثبّت وتيرتك.`
              : remaining === 0
                ? "الامتحان اليوم، بالتوفيق!"
                : "موعد الامتحان قد مضى، حدّثه من صفحة البيانات."}
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ label, value, Icon }) => (
          <div key={label} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-6 text-muted-foreground">{label}</p>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold tracking-tight">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}