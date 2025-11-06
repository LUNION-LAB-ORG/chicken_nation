import Quiz from "@/components/(public)/faq/faq";
import HeroSection from "@/components/(public)/common/hero-section";
import { faqMetadata, faqSchema } from "./meta";

export { faqMetadata };

export default function Faq() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HeroSection title="FAQ" src="/assets/images/backgrounds/faq.jpeg" />
      <div className="p-2 md:p-20">
        <Quiz />
      </div>
    </>
  );
}
