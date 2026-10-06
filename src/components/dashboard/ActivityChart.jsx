import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatArabicDate } from "@/lib/labels";

export default function ActivityChart({ daily }) {
  const data = (daily ?? []).map((point) => ({
    count: point.count,
    label: formatArabicDate(point.date, { day: "numeric", month: "short" }),
  }));
  const hasActivity = data.some((point) => point.count > 0);

  return (
    <section className="panel p-6">
      <h2 className="font-bold">نشاطك خلال آخر أسبوع</h2>
      <p className="mt-1 text-sm text-muted-foreground">عدد الأسئلة التي حللتها كل يوم.</p>

      <div className="mt-6 h-60">
        {hasActivity ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                allowDecimals={false}
                width={26}
                orientation="right"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--secondary))" }}
                formatter={(value) => [`${value} سؤال`, "الأسئلة"]}
                contentStyle={{
                  borderRadius: 16,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  fontFamily: "Tajawal",
                  direction: "rtl",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center text-sm text-muted-foreground">
            لا يوجد نشاط بعد — ابدأ جلسة تدريب من صفحة الدردشة وستظهر أرقامك هنا.
          </div>
        )}
      </div>
    </section>
  );
}