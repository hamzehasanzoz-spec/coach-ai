import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export default function CtaBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary px-8 py-14 text-center text-primary-foreground sm:px-14">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(60%_80%_at_85%_10%,white,transparent)]" />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">جاهز لتبدأ مراجعتك اليوم؟</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-primary-foreground/85">
            أنشئ حسابك، حدّد موعد امتحانك، وابدأ أول جلسة مع كوتش AI خلال دقيقة.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full px-8 text-base font-semibold">
            <Link to="/register">إنشاء حساب جديد</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}