import Special from "@/components/(public)/home/special";
import List from "@/components/(public)/restaurant/list";
import HeroSection from "@/components/(public)/common/hero-section";
import { pageMetadata } from "../../meta";

export const metadata = pageMetadata({
  chemin: "/restaurants",
  titre: "Nos restaurants à Abidjan",
  description:
    "Nos restaurants à Marcory Zone 4, Angré, Sococé, Riviera Faya et Yopougon, ouverts tous les jours dès 10h. Commandez en ligne, en livraison ou à emporter.",
});

export default function Restaurants() {
  return (
    <div>
      <HeroSection
        title="NOS RESTAURANTS"
        src="/assets/images/backgrounds/restaurant.png"
      />
      <List />
      <Special />
    </div>
  );
}
