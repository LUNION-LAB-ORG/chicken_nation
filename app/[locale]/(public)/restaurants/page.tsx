import Special from "@/components/(public)/home/special";
import List from "@/components/(public)/restaurant/list";
import HeroSection from "@/components/(public)/common/hero-section";
import { pageMetadata } from "../../meta";

export const metadata = pageMetadata({
  chemin: "/restaurants",
  titre: "Nos restaurants à Abidjan",
  description:
    "Trouvez le restaurant CHICKEN NATION le plus proche : Marcory Zone 4, Angré, Sococé, Riviera Faya et Yopougon. Ouverts tous les jours dès 10h, sur place, à emporter ou en livraison.",
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
