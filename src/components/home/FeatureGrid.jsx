import { FileText, ListChecks, MessageSquareText } from "lucide-react";

const FEATURES = [
  {
    Icon: MessageSquareText,
    title: "اشرح لي",
    body: "اسأل عن أي موضوع طبي واحصل على شرح مرتب بالعربية: عناوين قصيرة، أمثلة سريرية، وأخطاء شائعة يجب تجنّبها في الوطني.",
  },
  {
    Icon: ListChecks,
    title: "اختبرني",
    body: "أسئلة اختيار من متعدد (MCQ) على نمط الامتحان الوطني من بنك الأسئلة، مع تصحيح فوري وشرح لسبب صحة الإجابة.",
  },
  {
    Icon: FileText,
    title: "راجع ملاحظاتي",
    body: "ارفع ملف المحاضرة أو ملخصاتك الطبية، ودع الكوتش يلخّصها إلى نقاط مركزة وأسئلة محتملة قبل المراجعة.",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20" dir="rtl">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">ثلاث طرق للدراسة، مدرّب واحد</h2>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          كل ما تحتاجه للمراجعة في مكان واحد، مصمّم ليكون سريعاً وهادئاً وقت الدراسة.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {FEATURES.map(({ Icon, title, body }) => (
          <article
            key={title}
            className="panel group p-7 transition-transform duration-300 hover:-translate-y-1"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-xl font-bold">{title}</h3>
            <p className="mt-3 leading-8 text-muted-foreground">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}