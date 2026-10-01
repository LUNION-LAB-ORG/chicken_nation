import HeroSection from "@/components/(public)/common/hero-section";
import ListPlats from "@/components/(public)/restaurant/list-plats";
import { carteSchemaOrg, obtenirCartePublique } from "@/features/menus/apis/menu-public.api";
import { pageMetadata } from "../../../meta";

export const metadata = pageMetadata({
  chemin: "/restaurants/nos-menus",
  titre: "Nos menus et nos prix",
  description:
    "Box, combos, poulet pané, ailes crispy et tenders : toute la carte CHICKEN NATION avec les prix en FCFA et les promotions du moment.",
});

export default async function NosMenus() {
  const categories = await obtenirCartePublique();
  return (
    <>
      {categories.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(carteSchemaOrg(categories)) }}
        />
      )}
      <HeroSection
        title="NOS MENUS"
        src="/assets/images/backgrounds/restaurant-detail.png"
      />
      <ListPlats categories={categories} />
    </>
  );
}
