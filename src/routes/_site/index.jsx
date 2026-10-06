import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/home/Hero";
import FeatureGrid from "@/components/home/FeatureGrid";
import PlatformSection from "@/components/home/PlatformSection";
import CtaBand from "@/components/home/CtaBand";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "كوتش AI — مدرّبك الذكي للامتحان الوطني الطبي" },
      {
        name: "description",
        content: "اشرح، اختبر نفسك، ولخّص ملاحظاتك بالعربية، مع خطة دراسية ومتابعة لتقدمك حتى الامتحان الوطني.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <PlatformSection />
      <CtaBand />
    </>
  );
}