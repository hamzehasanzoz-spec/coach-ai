import { ListChecks, MessageSquareText, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import ExplainForm from "@/components/chat/ExplainForm";
import QuizForm from "@/components/chat/QuizForm";
import NotesForm from "@/components/chat/NotesForm";

const MODES = [
  { id: "explain", label: "اشرح لي", Icon: MessageSquareText },
  { id: "quiz", label: "اختبرني", Icon: ListChecks },
  { id: "notes", label: "راجع ملاحظاتي", Icon: Paperclip },
];

export default function ChatComposer({ mode, setMode, busy, topics, onSend, onStartQuiz, onNotes }) {
  return (
    <div className="border-t border-border bg-card/60 p-3 sm:p-4">
      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto">
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              mode === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {mode === "explain" && <ExplainForm busy={busy} onSend={onSend} />}
      {mode === "quiz" && <QuizForm busy={busy} topics={topics} onStart={onStartQuiz} />}
      {mode === "notes" && <NotesForm busy={busy} onNotes={onNotes} />}
    </div>
  );
}