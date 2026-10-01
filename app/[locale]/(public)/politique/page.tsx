import Policy from "@/components/(public)/politique/policy";
import HeroSection from "@/components/(public)/common/hero-section";
import { pageMetadata } from "../../meta";

export const metadata = pageMetadata({
  chemin: "/politique",
  titre: "Termes et conditions",
  description:
    "Conditions générales d'utilisation des services CHICKEN NATION : commandes, livraison, paiement et données personnelles.",
});

export default function Politic() {
  return (
    <div>
      <HeroSection title="TERMES ET CONDITIONS" src="/assets/images/backgrounds/terme.jpeg" />
      <Policy />
    </div>
  );
}
