import { Benefits } from "@/components/(public)/mobile/benefits";
import { BentoGrid } from "@/components/(public)/mobile/bento";
import { FeatureHighlight } from "@/components/(public)/mobile/feature-highlight";
import { FeatureScroll } from "@/components/(public)/mobile/feature-scroll";
import { Features } from "@/components/(public)/mobile/features";
import { Hero } from "@/components/(public)/mobile/hero";
import Testimonials from "@/components/(public)/home/testimonials";
import { pageMetadata } from "../../meta";
import { setRequestLocale } from "next-intl/server";

// Statique, reconstruite au plus toutes les heures (avis lus dans l'API).
export const revalidate = 3600;

export const metadata = pageMetadata({
  chemin: "/app-mobile",
  titre: "Application mobile",
  description:
    "Commandez CHICKEN NATION depuis votre téléphone : paiement en ligne, suivi de la livraison en direct et avantages fidélité. Sur iPhone et Android.",
});

export default async function AppMobile({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <FeatureScroll />
      <FeatureHighlight />
      <BentoGrid />
      <Benefits />
      <Features />
      <Testimonials />
    </>
  );
}
