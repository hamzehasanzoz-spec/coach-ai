import { CalendarCheck, LineChart, History } from "lucide-react";

const ITEMS = [
  {
    Icon: LineChart,
    title: "تقدّمك بالأرقام",
    body: "عدد الأسئلة التي حللتها ونسبة إجاباتك الصحيحة، مع نشاطك اليومي خلال الأسبوع.",
  },
  {
    Icon: CalendarCheck,
    title: "خطة دراسية واضحة",
    body: "وزّع المواد الطبيّة على أيامك، وحدّد ما أنجزته، وشاهد العدّ التنازلي حتى موعد الامتحان.",
  },
  {
    Icon: History,
    title: "سجل محادثاتك",
    body: "كل شرح وسؤال محفوظ، تعود إليه لاحقاً لتراجع ما درسته بدون أن تبدأ من الصفر.",
  },
];

export default function PlatformSection() {
  return (
    <section id="platform" className="border-y border-border/70 bg-card/50 py-16 lg:py-20" dir="rtl">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold text-primary">لوحة التحكم</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">اعرف أين أنت من الامتحان</h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            لا تدرس بشكل عشوائي. لوحة التحكم تجمع لك كل ما يهم: أرقامك، خطتك، وآخر ما راجعته.
          </p>
        </div>

        <ul className="space-y-4">
          {ITEMS.map(({ Icon, title, body }) => (
            <li key={title} className="flex gap-4 rounded-3xl border border-border bg-background p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-1 leading-7 text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}