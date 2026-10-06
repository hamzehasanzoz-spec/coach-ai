import Logo from "@/components/layout/Logo";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <Logo />
        <p className="text-center sm:text-start">كوتش AI — منصة عربية لطلاب الطب في التحضير للامتحان الوطني.</p>
      </div>
    </footer>
  );
}