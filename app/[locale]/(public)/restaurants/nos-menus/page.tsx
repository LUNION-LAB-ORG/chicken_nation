import { ToastProvider } from "@heroui/toast";
import HeroSection from "@/components/(public)/common/hero-section";
import ListPlats from "@/components/(public)/restaurant/list-plats";
import { carteSchemaOrg, obtenirCartePublique } from "@/features/menus/apis/menu-public.api";
import { pageMetadata } from "../../../meta";
import { setRequestLocale } from "next-intl/server";

// Statique, reconstruite au plus tous les quarts d'heure (carte lue dans l'API).
export const revalidate = 900;

export const metadata = pageMetadata({
  chemin: "/restaurants/nos-menus",
  titre: "Menu, prix et commande en ligne",
  description:
    "Box, combos, poulet pané, ailes crispy et tenders : toute la carte CHICKEN NATION avec les prix en FCFA. Commandez en ligne, en livraison ou à emporter.",
});

export default async function NosMenus({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const categories = await obtenirCartePublique();
  return (
    <>
      {/* Message « ajouté au panier » de la fiche plat (HeroUI, provisoire
          jusqu'à la nouvelle carte, lot L7). */}
      <ToastProvider placement="top-center" toastProps={{ shouldShowTimeoutProgress: true }} />
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
