import Quiz from "@/components/(public)/faq/faq";
import HeroSection from "@/components/(public)/common/hero-section";
import { faqMetadata, faqSchema } from "./meta";
import { setRequestLocale } from "next-intl/server";

export { faqMetadata as metadata };

export default async function Faq({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

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
