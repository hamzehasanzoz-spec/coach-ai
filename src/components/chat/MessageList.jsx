import { useEffect, useRef } from "react";
import { Loader2, Sparkles } from "lucide-react";
import MessageBubble from "@/components/chat/MessageBubble";
import QuizCard from "@/components/chat/QuizCard";

const SUGGESTIONS = [
  "اشرح لي آلية عمل القلب خطوة بخطوة",
  "ما الفرق بين الالتهاب الرئوي الفيروسي والجرثومي؟",
  "لخّص لي أهم أدوية ارتفاع ضغط الدم",
];

function EmptyState({ onQuickAsk }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <Sparkles className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl font-bold">أهلاً بك في كوتش AI</h2>
      <p className="mt-2 leading-8 text-muted-foreground">
        اسأل عن أي موضوع طبي، أو اختبر نفسك بسؤال، أو ارفع ملاحظاتك ولخّصها.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onQuickAsk(suggestion)}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MessageList({ messages, busy, quiz, onAnswer, onNextQuestion, onQuickAsk }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, busy, quiz?.selected]);

  if (messages.length === 0 && !quiz && !busy) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <EmptyState onQuickAsk={onQuickAsk} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="space-y-4">
        {messages.map((message) =>
          quiz && message.id === quiz.messageId ? null : <MessageBubble key={message.id} message={message} />,
        )}

        {quiz && <QuizCard quiz={quiz} busy={busy} onAnswer={onAnswer} onNext={onNextQuestion} />}

        {busy && (
          <div className="flex justify-start">
            <span className="flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              الكوتش يفكّر...
            </span>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}