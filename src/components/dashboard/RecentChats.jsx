import { Link } from "@tanstack/react-router";
import { History, MessagesSquare } from "lucide-react";
import { formatArabicDate } from "@/lib/labels";

export default function RecentChats({ conversations }) {
  const recent = conversations.slice(0, 5);

  return (
    <section className="panel flex flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">آخر محادثاتك</h2>
          <p className="mt-1 text-sm text-muted-foreground">عُد إلى أي جلسة من حيث توقفت.</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
          <History className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <ul className="mt-6 flex-1 space-y-2">
        {recent.length === 0 && (
          <li className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
            <MessagesSquare className="h-6 w-6 text-primary/60" aria-hidden="true" />
            لا توجد محادثات بعد.
          </li>
        )}
        {recent.map((conversation) => (
          <li key={conversation.id}>
            <Link
              to="/chat"
              search={{ c: conversation.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 transition-colors hover:border-primary"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{conversation.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {formatArabicDate(conversation.updated_date, { day: "numeric", month: "short" })}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link to="/chat" className="mt-5 text-sm font-medium text-primary hover:underline">
        فتح الدردشة
      </Link>
    </section>
  );
}