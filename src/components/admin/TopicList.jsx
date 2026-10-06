import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createTopic, deleteTopic } from "@/lib/server-fns";

export default function TopicList({ topics, selected, onSelect }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [busy, setBusy] = useState(false);

  async function add(event) {
    event.preventDefault();
    if (name.trim().length < 2 || busy) return;
    setBusy(true);
    try {
      const topic = await createTopic({ data: { name: name.trim(), subject } });
      setName("");
      setSubject("");
      onSelect(topic.name);
      await router.invalidate();
    } catch {
      toast.error("تعذّر إضافة الموضوع.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    await deleteTopic({ data: { id } });
    await router.invalidate();
    toast.success("تم حذف الموضوع وأسئلته.");
  }

  return (
    <section className="panel flex flex-col overflow-hidden">
      <div className="border-b border-border p-5">
        <h2 className="font-bold">المواضيع</h2>
        <form onSubmit={add} className="mt-4 space-y-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="اسم الموضوع"
            className="h-11 rounded-xl border-border bg-background"
          />
          <Input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="المادة التابعة لها (اختياري)"
            className="h-11 rounded-xl border-border bg-background"
          />
          <Button type="submit" disabled={busy || name.trim().length < 2} className="h-11 w-full gap-2 rounded-xl">
            <Plus className="h-4 w-4" aria-hidden="true" />
            إضافة موضوع
          </Button>
        </form>
      </div>

      <ul className="max-h-[26rem] space-y-1 overflow-y-auto p-2">
        {topics.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">لا توجد مواضيع بعد.</li>
        )}
        {topics.map((topic) => (
          <li key={topic.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(topic.name)}
              className={cn(
                "min-w-0 flex-1 rounded-xl px-3 py-2.5 text-start transition-colors",
                topic.name === selected ? "bg-secondary text-primary" : "hover:bg-secondary/60",
              )}
            >
              <span className="block truncate text-sm font-medium">{topic.name}</span>
              {topic.subject && <span className="mt-0.5 block text-xs text-muted-foreground">{topic.subject}</span>}
            </button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="حذف الموضوع"
              onClick={() => remove(topic.id)}
              className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}