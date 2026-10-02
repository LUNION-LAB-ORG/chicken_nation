import HeroSection from "@/components/(public)/common/hero-section";
import ListPlats from "@/components/(public)/restaurant/list-plats";
import { carteSchemaOrg, obtenirCartePublique } from "@/features/menus/apis/menu-public.api";
import { pageMetadata } from "../../../meta";

export const metadata = pageMetadata({
  chemin: "/restaurants/nos-menus",
  titre: "Menu, prix et commande en ligne",
  description:
    "Box, combos, poulet pané, ailes crispy et tenders : toute la carte CHICKEN NATION avec les prix en FCFA. Commandez en ligne, en livraison ou à emporter.",
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
      {/* Page d'arrivée de tous les liens « Commander » : bannière basse pour
          que les premiers plats et leur bouton « Ajouter » se voient tout de suite. */}
      <HeroSection
        title="NOS MENUS"
        src="/assets/images/backgrounds/restaurant-detail.png"
        compact
        sousTitre="Ajoutez vos plats au panier : livraison ou à emporter, paiement en ligne."
      />
      <ListPlats categories={categories} />
    </>
  );
}
