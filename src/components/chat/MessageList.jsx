import { useEffect, useRef } from "react";
import { Bot, User, Loader2, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  "اشرح لي التدبير العاجل لالتهاب الزائدة الدودية الحاد",
  "ما هي العلامات السريرية الفارقة لقصور القلب الأيسر؟",
  "اختبرني بسؤال أتمتة في مادة الجراحة العامة",
  "تلخيص أهم النقاط في مقاربة فقر الدم بقلة الصفيحات",
];

export default function MessageList({ messages, busy, quiz, onAnswer, onNextQuestion, onQuickAsk }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, quiz]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center text-center py-12">
          <div className="rounded-full bg-primary/10 p-4 mb-4 text-primary">
            <Bot className="h-8 w-8" />
          </div>
          <h3 className="font-bold text-lg">أهلاً بك مع كوتش AI</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-1 mb-6">
            مساعدك الطبي المخصص للتحضير للامتحان الوطني الموحد. اختر من الأسئلة المقترحة أو اكتب سؤالك أدناه.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 max-w-xl w-full">
            {QUICK_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                className="h-auto whitespace-normal p-3 text-xs text-start justify-start rounded-xl leading-relaxed"
                onClick={() => onQuickAsk(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, index) => {
        const isUser = msg.role === "user";
        return (
          <div key={msg.id || index} className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
              {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn("max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed", isUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none")}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        );
      })}

      {quiz && (
        <div className="rounded-2xl border border-primary/20 bg-accent/40 p-5 mt-4">
          <div className="flex items-center gap-2 mb-3 text-primary font-bold text-sm">
            <HelpCircle className="h-5 w-5" />
            <span>سؤال أتمتة (MCQ) — {quiz.question.topic_name}</span>
          </div>
          <p className="font-medium text-sm mb-4 leading-relaxed">{quiz.question.text}</p>
          <div className="space-y-2">
            {quiz.question.options.map((option, idx) => {
              const isSelected = quiz.selected === idx;
              const isCorrect = quiz.result?.correct_index === idx;
              return (
                <Button
                  key={idx}
                  variant={isSelected ? (quiz.result?.correct ? "default" : "destructive") : "outline"}
                  className={cn(
                    "w-full justify-start text-start h-auto py-3 px-4 rounded-xl text-xs sm:text-sm whitespace-normal",
                    quiz.selected !== null && isCorrect && "bg-emerald-600 text-white hover:bg-emerald-700"
                  )}
                  disabled={quiz.selected !== null}
                  onClick={() => onAnswer(idx)}
                >
                  <span className="ms-2 font-bold">{idx + 1}.</span> {option}
                </Button>
              );
            })}
          </div>

          {quiz.result && (
            <div className="mt-4 p-3 rounded-xl bg-card border border-border text-xs leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1">
                {quiz.result.correct ? (
                  <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> إجابة صحيحة</span>
                ) : (
                  <span className="text-destructive flex items-center gap-1"><XCircle className="h-4 w-4" /> إجابة خاطئة</span>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{quiz.result.explanation}</p>
              <Button size="sm" onClick={onNextQuestion} className="mt-3 rounded-lg text-xs">
                السؤال التالي
              </Button>
            </div>
          )}
        </div>
      )}

      {busy && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>الكوتش يفكر ويحلل الإجابة...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}