import { Plus, Trash2, MessageSquare, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatArabicDate } from "@/lib/labels";

export default function ConversationList({ conversations, activeId, onSelect, onNew, onDelete }) {
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) =>
    (c.title || "محادثة جديدة").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="panel flex h-auto flex-col p-4 lg:h-full lg:w-72 shrink-0">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="font-bold text-base flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          جلسات التدريب
        </h2>
        <Button size="sm" onClick={onNew} className="gap-1 rounded-xl">
          <Plus className="h-4 w-4" />
          جديدة
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث في المحادثات..."
          className="h-9 pr-9 text-xs rounded-xl border-border bg-background"
        />
      </div>

      <div className="no-scrollbar flex-1 space-y-1 overflow-y-auto max-h-48 lg:max-h-none">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">لا توجد محادثات مطابقة.</p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group flex items-center justify-between rounded-xl p-2.5 transition-colors cursor-pointer text-sm",
                item.id === activeId ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-muted-foreground"
              )}
              onClick={() => onSelect(item.id)}
            >
              <div className="min-w-0 flex-1 pl-2">
                <p className="truncate text-xs sm:text-sm">{item.title || "محادثة جديدة"}</p>
                <span className="text-[10px] text-muted-foreground/80 block mt-0.5">
                  {formatArabicDate(item.updated_date || item.created_date)}
                </span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:text-destructive rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}