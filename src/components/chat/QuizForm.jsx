import { useState } from "react";
import { ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function QuizForm({ busy, topics, onStart }) {
  const [topic, setTopic] = useState("");

  const suggestions = (topics ?? []).slice(0, 5).map((item) => item.name);

  async function submit() {
    const value = topic.trim();
    if (value.length < 2 || busy) return;
    setTopic("");
    await onStart(value);
  }

  return (
    <div className="space-y-2">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="عن أي موضوع تريد أن أختبرك؟ مثال: فسيولوجيا القلب"
          className="h-12 rounded-2xl border-border bg-background"
        />
        <Button type="submit" disabled={busy || topic.trim().length < 2} className="h-12 shrink-0 gap-2 rounded-2xl">
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          ابدأ
        </Button>
      </form>

      {suggestions.length > 0 && (
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {suggestions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setTopic(name)}
              className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}