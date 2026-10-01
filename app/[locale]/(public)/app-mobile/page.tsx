import { Benefits } from "@/components/(public)/mobile/benefits";
import { BentoGrid } from "@/components/(public)/mobile/bento";
import { FeatureHighlight } from "@/components/(public)/mobile/feature-highlight";
import { FeatureScroll } from "@/components/(public)/mobile/feature-scroll";
import { Features } from "@/components/(public)/mobile/features";
import { Hero } from "@/components/(public)/mobile/hero";
import Testimonials from "@/components/(public)/home/testimonials";
import { pageMetadata } from "../../meta";

export const metadata = pageMetadata({
  chemin: "/app-mobile",
  titre: "Application mobile",
  description:
    "Commandez CHICKEN NATION depuis votre téléphone : paiement en ligne, suivi de la livraison en direct et avantages fidélité. Sur iPhone et Android.",
});

export default function AppMobile() {
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
