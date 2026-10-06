import { ClientOnly, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";

const HERO_IMAGE =
  "https://media.base44.com/images/public/6ac535876df5411821494d3e/9ad8a77af_generated_image.png";

const POINTS = ["بالعربية بالكامل", "أسئلة بنمط الامتحان الوطني", "خطة دراسية تتابع تقدّمك"];

export default function Hero() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
      <div className="animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-primary">
          منصة عربية لطلاب الطب
        </span>
        <h1 className="mt-6 text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl lg:text-[3.4rem]">
          استعد للامتحان الوطني
          <br />
          مع مدرّب <span className="text-primary">يفهمك</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-9 text-muted-foreground">
          كوتش AI يشرح لك المفاهيم الطبية خطوة بخطوة، يختبرك بأسئلة على نمط الامتحان الوطني، ويلخّص ملاحظاتك — مع خطة
          دراسية ومتابعة دقيقة لتقدّمك.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="gap-2 rounded-full px-7 text-base">
            <Link to="/register">
              ابدأ مجاناً
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-7 text-base">
            <Link to="/login">تسجيل الدخول</Link>
          </Button>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
          {POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="panel animate-fade-in relative overflow-hidden p-3 [animation-delay:120ms]">
        <div className="h-64 w-full overflow-hidden rounded-2xl bg-secondary sm:h-80 lg:h-[26rem]">
          {/* Sized to the browser, so it renders client-side only. */}
          <ClientOnly fallback={<div className="h-full w-full bg-secondary" />}>
            <Image src={HERO_IMAGE} alt="طالب طب يدرس بمساعدة كوتش AI" className="h-full w-full" />
          </ClientOnly>
        </div>
      </div>
    </section>
  );
}