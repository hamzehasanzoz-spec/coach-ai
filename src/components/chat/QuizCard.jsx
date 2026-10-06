import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function QuizCard({ quiz, busy, onAnswer, onNext }) {
  const { question, selected, result } = quiz;
  const answered = selected !== null;

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="text-xs font-semibold text-primary">سؤال تدريبي · {question.topic_name}</p>
      <p className="mt-2 text-base font-semibold leading-8">{question.text}</p>

      <div className="mt-4 space-y-2">
        {question.options.map((option, index) => {
          const isCorrect = answered && result?.correct_index === index;
          const isWrongPick = answered && selected === index && result && !result.correct;
          return (
            <button
              key={index}
              type="button"
              disabled={answered || busy}
              onClick={() => onAnswer(index)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start text-sm transition-colors",
                !answered && "border-border hover:border-primary hover:bg-secondary/60",
                isCorrect && "border-chart-3 bg-chart-3/10",
                isWrongPick && "border-destructive bg-destructive/10",
                answered && !isCorrect && !isWrongPick && "border-border opacity-60",
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                {isCorrect ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : isWrongPick ? (
                  <X className="h-4 w-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="leading-7">{option}</span>
            </button>
          );
        })}
      </div>

      {answered ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className={cn("text-sm font-semibold", result?.correct ? "text-chart-3" : "text-destructive")}>
            {result?.correct ? "أحسنت! إجابة صحيحة." : "إجابة غير صحيحة — راجع الشرح أدناه."}
          </p>
          <Button variant="outline" size="sm" className="gap-2 rounded-full" onClick={onNext} disabled={busy}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            سؤال جديد
          </Button>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">اختر إجابة واحدة ليتم تصحيحها فوراً.</p>
      )}
    </div>
  );
}