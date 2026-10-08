import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2, HelpCircle } from "lucide-react";
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
    try {
      await deleteQuestion({ data: { id } });
      invalidate();
      toast.success("تم حذف السؤال.");
    } catch {
      toast.error("تعذّر حذف السؤال.");
    }
  }

  if (!topicName) {
    return (
      <section className="panel flex items-center justify-center p-10 text-center text-sm text-muted-foreground">
        اختر موضوعاً من القائمة الجانبية أو أضف موضوعاً جديداً لتبدأ بإدارة الأسئلة.
      </section>
    );
  }

  return (
    <section className="panel flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            بنك الأسئلة — {topicName}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">تظهر هذه الأسئلة لطلاب الامتحان الوطني في وضع «اختبرني».</p>
        </div>
        <Button
          className="gap-2 rounded-xl text-xs sm:text-sm"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          سؤال جديد
        </Button>
      </div>

      <div className="max-h-[32rem] space-y-3 overflow-y-auto p-5">
        {isLoading && (
          <p className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            جاري جلب الأسئلة...
          </p>
        )}

        {!isLoading && questions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            لا توجد أسئلة مضافة لهذا الموضوع بعد.
          </p>
        )}

        {questions.map((question) => (
          <article key={question.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-sm leading-relaxed">{question.text}</p>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setEditing(question);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                  onClick={() => remove(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ul className="mt-3 space-y-1.5 text-xs sm:text-sm">
              {(question.options ?? []).map((option, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-bold text-muted-foreground">{index + 1}.</span>
                  <span className={index === question.correct_index ? "font-bold text-emerald-600" : "text-muted-foreground"}>
                    {option}
                  </span>
                  {index === question.correct_index && (
                    <Badge variant="secondary" className="rounded-full text-[10px] bg-emerald-100 text-emerald-700">
                      الإجابة الصحيحة
                    </Badge>
                  )}
                </li>
              ))}
            </ul>

            {question.explanation && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground border-t border-border/50 pt-2">
                <strong>الشرح الطّبي:</strong> {question.explanation}
              </p>
            )}
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