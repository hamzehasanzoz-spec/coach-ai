import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { studyStyleLabel, studyTimeLabel } from "@/lib/labels";

function Row({ label, children }) {
  return (
    <div className="border-b border-border pb-4 last:border-0 last:pb-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}

export default function QuestionnaireSummary({ profile }) {
  const done = profile?.questionnaire_completed === true;
  const times = Array.isArray(profile?.study_times) ? profile.study_times : [];
  const subjects = Array.isArray(profile?.weak_subjects) ? profile.weak_subjects : [];

  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">الاستبيان الدراسي</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            يستخدمه الكوتش لتخصيص الشرح والأسئلة والخطة الدراسية.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2 rounded-full">
          <Link to="/questionnaire" search={{ next: "/profile" }}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {done ? "تعديل الاستبيان" : "ابدأ الاستبيان"}
          </Link>
        </Button>
      </div>

      {!done ? (
        <p className="mt-5 rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
          لم تُكمل الاستبيان بعد — أكمله ليخصّص الكوتش دراستك لك.
        </p>
      ) : (
        <dl className="mt-5 space-y-4 text-sm">
          <Row label="أسلوب الدراسة">
            <span className="font-medium">{studyStyleLabel(profile.study_style)}</span>
          </Row>

          <Row label="أوقات الدراسة المفضّلة">
            {times.length === 0 ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              <span className="flex flex-wrap gap-2">
                {times.map((time) => (
                  <span key={time} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {studyTimeLabel(time)}
                  </span>
                ))}
              </span>
            )}
          </Row>

          <Row label="المواد الضعيفة">
            {subjects.length === 0 ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              <span className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <span key={subject} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {subject}
                  </span>
                ))}
              </span>
            )}
          </Row>

          <Row label="الخلفية الطبية">
            <span className="leading-8">
              {profile.medical_background || <span className="text-muted-foreground">—</span>}
            </span>
          </Row>
        </dl>
      )}
    </section>
  );
}