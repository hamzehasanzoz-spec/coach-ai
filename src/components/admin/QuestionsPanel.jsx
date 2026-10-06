import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QuestionDialog from "@/components/admin/QuestionDialog";
import { deleteQuestion, listQuestions } from "@/lib/server-fns";

export default function QuestionsPanel({ topicName }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["questions", topicName],
    queryFn: () => listQuestions({ data: { topic_name: topicName } }),
    enabled: Boolean(topicName),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["questions", topicName] });
  }

  async function remove(id) {
    await deleteQuestion({ data: { id } });
    invalidate();
    toast.success("تم حذف السؤال.");
  }

  if (!topicName) {
    return (
      <section className="panel flex items-center justify-center p-10 text-center text-sm text-muted-foreground">
        اختر موضوعاً أو أضف موضوعاً جديداً لتبدأ بإضافة الأسئلة.
      </section>
    );
  }

  return (
    <section className="panel flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-bold">بنك الأسئلة — {topicName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">تظهر هذه الأسئلة للطلاب في وضع «اختبرني».</p>
        </div>
        <Button
          className="gap-2 rounded-xl"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          سؤال جديد
        </Button>
      </div>

      <div className="max-h-[32rem] space-y-3 overflow-y-auto p-5">
        {isLoading && (
          <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            جاري التحميل…
          </p>
        )}

        {!isLoading && questions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            لا توجد أسئلة لهذا الموضوع بعد.
          </p>
        )}

        {questions.map((question) => (
          <article key={question.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium leading-8">{question.text}</p>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="تعديل السؤال"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setEditing(question);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="حذف السؤال"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => remove(question.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <ul className="mt-3 space-y-1 text-sm">
              {(question.options ?? []).map((option, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-bold text-muted-foreground">{index + 1}</span>
                  <span className={index === question.correct_index ? "font-semibold text-chart-3" : "text-muted-foreground"}>
                    {option}
                  </span>
                  {index === question.correct_index && (
                    <Badge variant="secondary" className="rounded-full text-chart-3">
                      صحيحة
                    </Badge>
                  )}
                </li>
              ))}
            </ul>

            {question.explanation && <p className="mt-3 text-sm leading-7 text-muted-foreground">{question.explanation}</p>}
          </article>
        ))}
      </div>

      <QuestionDialog
        open={open}
        onOpenChange={setOpen}
        topicName={topicName}
        question={editing}
        onSaved={invalidate}
      />
    </section>
  );
}