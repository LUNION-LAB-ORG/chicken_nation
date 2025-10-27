import Quiz from "@/components/(public)/faq/faq";
import HeroSection from "@/components/(public)/common/hero-section";

export default function Faq() {
  return (
    <div>
      <HeroSection title="FAQ" src="/assets/images/backgrounds/faq.png" />
      <div className="p-2 md:p-20">
        <Quiz />
      </div>
    </div>
  );
}
