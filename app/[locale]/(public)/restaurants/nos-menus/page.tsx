import HeroSection from "@/components/(public)/common/hero-section";
import ListPlats from "@/components/(public)/restaurant/list-plats";
import { pageMetadata } from "../../../meta";

export const metadata = pageMetadata({
  chemin: "/restaurants/nos-menus",
  titre: "Nos menus et nos prix",
  description:
    "Poulets grillés, crispy tenders, ailes, burgers, lunchs, suppléments et boissons : toute la carte CHICKEN NATION avec les prix en FCFA.",
});

export default function Marcory() {
  return (
    <>
      <HeroSection
        title="NOS MENUS"
        src="/assets/images/backgrounds/restaurant-detail.png"
      />
      <ListPlats />
    </>
  );
}
