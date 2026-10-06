import { Activity, BookOpenCheck, MessagesSquare, Target, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { formatArabicDate } from "@/lib/labels";

export default function UsagePanel({ usage }) {
  const cards = [
    { label: "الطلاب", value: usage.users.students, Icon: Users },
    { label: "المديرون", value: usage.users.admins, Icon: Target },
    { label: "أسئلة محلولة", value: usage.attempts, Icon: BookOpenCheck },
    { label: "دقة الإجابات", value: `${usage.accuracy}%`, Icon: Activity },
    { label: "محادثات", value: usage.conversations, Icon: MessagesSquare },
    { label: "رسائل", value: usage.messages, Icon: MessagesSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="panel flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">{value}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="font-bold">أكثر المواضيع تدريباً</h2>
          <p className="mt-1 text-sm text-muted-foreground">عدد الأسئلة التي حلّها الطلاب لكل موضوع.</p>

          <div className="mt-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">الموضوع</TableHead>
                  <TableHead className="text-start">عدد الأسئلة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.topics.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                      لا يوجد تدريب مسجّل بعد.
                    </TableCell>
                  </TableRow>
                )}
                {usage.topics.map((row) => (
                  <TableRow key={row.topic}>
                    <TableCell className="font-medium">{row.topic}</TableCell>
                    <TableCell className="text-muted-foreground">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="font-bold">أحدث المنضمين</h2>
          <p className="mt-1 text-sm text-muted-foreground">آخر من أنشأ حساباً في المنصة.</p>

          <ul className="mt-5 space-y-3">
            {usage.users.latest.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                لا يوجد مستخدمون بعد.
              </li>
            )}
            {usage.users.latest.map((user) => (
              <li key={user.email} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground" dir="ltr">
                    {user.email}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatArabicDate(user.created_date)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ActivityChart daily={usage.daily} />
    </div>
  );
}