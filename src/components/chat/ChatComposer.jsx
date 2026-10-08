import { useState, useRef } from "react";
import { Send, BookOpen, FileUp, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ChatComposer({ mode, setMode, busy, topics, onSend, onStartQuiz, onNotes }) {
  const [text, setText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(topics[0]?.name ?? "");
  const fileInputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (mode === "explain") {
      if (!text.trim() || busy) return;
      onSend(text.trim());
      setText("");
    } else if (mode === "quiz") {
      if (!selectedTopic || busy) return;
      onStartQuiz(selectedTopic);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    onNotes(file, file.name);
    e.target.value = "";
  }

  return (
    <div className="border-t border-border p-3 bg-card">
      <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
        <Button
          size="sm"
          variant={mode === "explain" ? "default" : "ghost"}
          className="rounded-xl text-xs gap-1.5 h-8"
          onClick={() => setMode("explain")}
        >
          <BookOpen className="h-3.5 w-3.5" />
          اشرح لي
        </Button>
        <Button
          size="sm"
          variant={mode === "quiz" ? "default" : "ghost"}
          className="rounded-xl text-xs gap-1.5 h-8"
          onClick={() => setMode("quiz")}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          اختبرني
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-xl text-xs gap-1.5 h-8 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="h-3.5 w-3.5" />
          رفع محاضرة/ملخص
        </Button>
        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        {mode === "explain" ? (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="اسأل الكوتش عن أي مفهوم أو حالة سريرية..."
            rows={2}
            className="min-h-[2.5rem] flex-1 resize-none rounded-xl border-border bg-background p-2.5 text-xs sm:text-sm focus-visible:ring-1"
          />
        ) : (
          <div className="flex-1 space-y-1">
            <span className="text-[11px] text-muted-foreground block">اختر المادة أو الموضوع للاختبار:</span>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="h-10 rounded-xl border-border bg-background text-xs sm:text-sm">
                <SelectValue placeholder="اختر موضوعاً" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name} {t.subject ? `(${t.subject})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button type="submit" disabled={busy || (mode === "explain" && !text.trim())} className="h-10 w-10 shrink-0 rounded-xl">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}