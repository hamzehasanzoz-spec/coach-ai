import { MessageSquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatArabicDate } from "@/lib/labels";

export default function ConversationList({ conversations, activeId, onSelect, onNew, onDelete }) {
  return (
    <aside className="panel flex w-full shrink-0 flex-col overflow-hidden lg:w-72">
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <h2 className="px-1 font-bold">محادثاتي</h2>
        <Button size="sm" variant="ghost" className="gap-1.5 rounded-full text-primary" onClick={onNew}>
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          جديدة
        </Button>
      </div>

      <div className="max-h-56 overflow-y-auto p-2 lg:max-h-none lg:flex-1">
        {conversations.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">لا توجد محادثات بعد. ابدأ محادثة جديدة مع الكوتش.</p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={cn(
                    "min-w-0 flex-1 rounded-xl px-3 py-2 text-start transition-colors",
                    conversation.id === activeId ? "bg-secondary text-primary" : "hover:bg-secondary/60",
                  )}
                >
                  <span className="block truncate text-sm font-medium">{conversation.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatArabicDate(conversation.updated_date, { day: "numeric", month: "short" })}
                  </span>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="حذف المحادثة"
                  onClick={() => onDelete(conversation.id)}
                  className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}