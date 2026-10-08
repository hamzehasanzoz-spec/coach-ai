import { Activity, BookOpenCheck, MessagesSquare, Target, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { formatArabicDate } from "@/lib/labels";

export default function UsagePanel({ usage }) {
  const cards = [
    { label: "إجمالي الطلاب", value: usage.users.students, Icon: Users },
    { label: "المدراء والمشرفون", value: usage.users.admins, Icon: Target },
    { label: "الأسئلة المحلولة", value: usage.attempts, Icon: BookOpenCheck },
    { label: "دقة الإجابات الكلية", value: `${usage.accuracy}%`, Icon: Activity },
    { label: "المحادثات الطبية", value: usage.conversations, Icon: MessagesSquare },
    { label: "إجمالي الرسائل", value: usage.messages, Icon: MessagesSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="panel flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{value}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Icon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <h2 className="font-bold text-sm sm:text-base">أكثر المواضيع تدريباً</h2>
          <p className="mt-1 text-xs text-muted-foreground">عدد الأسئلة التي أجاب عليها الطلاب لكل محوَر طبي.</p>

          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">الموضوع الطبي</TableHead>
                  <TableHead className="text-start">الأسئلة المحلولة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.topics.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-6 text-center text-xs text-muted-foreground">
                      لا يوجد نشاط تدريبي مسجل بعد.
                    </TableCell>
                  </TableRow>
                )}
                {usage.topics.map((row) => (
                  <TableRow key={row.topic}>
                    <TableCell className="font-medium text-xs sm:text-sm">{row.topic}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.count} سؤال</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="panel p-6">
          <h2 className="font-bold text-sm sm:text-base">أحدث الطلاب المنضمين</h2>
          <p className="mt-1 text-xs text-muted-foreground">آخر الحسابات المسجلة في منصة كوتش AI.</p>

          <ul className="mt-4 space-y-2.5">
            {usage.users.latest.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                لا يوجد مستخدمون جدد بعد.
              </li>
            )}
            {usage.users.latest.map((user) => (
              <li key={user.email} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate font-medium text-xs sm:text-sm">{user.full_name}</p>
                  <p className="truncate text-[10px] text-muted-foreground" dir="ltr">
                    {user.email}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">{formatArabicDate(user.created_date)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ActivityChart daily={usage.daily} />
    </div>
  );
}