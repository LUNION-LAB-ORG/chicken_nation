import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../meta";

import { Accroche } from "@/components/site/accueil/Accroche";
import { BandeInfos } from "@/components/site/accueil/BandeInfos";
import { CommanderEnLigne } from "@/components/site/accueil/CommanderEnLigne";
import { LaMarque } from "@/components/site/accueil/LaMarque";
import { Promotions } from "@/components/site/accueil/Promotions";
import { TuilesCategories } from "@/components/site/accueil/TuilesCategories";
import { VosAvantages } from "@/components/site/accueil/VosAvantages";
import { BlocAppli } from "@/components/site/appli/BlocAppli";
import { BlocAvis } from "@/components/site/avis/BlocAvis";
import { SectionRestaurants } from "@/components/site/restaurants/SectionRestaurants";
import { obtenirAvisPublics } from "@/features/client/commentaire.api";
import { obtenirConfigFidelite } from "@/features/fidelite/fidelite.api";
import { obtenirCartePublique } from "@/features/menus/apis/menu-public.api";
import { platEnVedette } from "@/features/menus/carte";
import { CLE_PROMOTIONS } from "@/features/menus/carte.categories";
import { obtenirOffresDuMoment } from "@/features/promotion/promotion.api";
import { obtenirRestaurantsDuSite } from "@/features/restaurants/restaurant.api";
import { INSECABLE } from "@/lib/typo";

// Statique, reconstruite au plus toutes les 5 minutes : les offres du moment
// sont gardées 300 s (décision du client), et Next applique à la page la plus
// courte des durées de ses lectures (carte 900 s, restaurants, fidélité et
// avis 3 600 s). Écrit ici pour que la sortie de `next build` ne surprenne pas.
export const revalidate = 300;

export const metadata = pageMetadata({
  chemin: "/",
  titreAbsolu: `CHICKEN NATION${INSECABLE}: poulet pané, burgers et box à Abidjan`,
  description: `Poulet 100${INSECABLE}% local et halal, burgers et box. Commandez en ligne${INSECABLE}: livraison dans le Grand Abidjan ou retrait au restaurant. Ouvert 7${INSECABLE}j/7 dès 10${INSECABLE}h.`,
});

/**
 * Accueil (plan, 3.3) : toutes les sections de la maquette, dans son ordre.
 * Une seule lecture de chaque source par rendu (fonctions en `cache`). Si la
 * carte ou les restaurants ne répondent pas, l'erreur garde la dernière
 * version valide de la page ; fidélité, offres et avis ont leur repli
 * (valeurs du 03/10, section masquée).
 */
export default async function Accueil({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [carte, restaurants, fidelite, offres, avis] = await Promise.all([
    obtenirCartePublique(),
    obtenirRestaurantsDuSite(),
    obtenirConfigFidelite(),
    obtenirOffresDuMoment(),
    obtenirAvisPublics(),
  ]);
  const promotions =
    carte.find((categorie) => categorie.cle === CLE_PROMOTIONS)?.plats ?? [];

  return (
    <>
      <Accroche
        nombreRestaurants={restaurants.length}
        vedette={platEnVedette(carte)}
      />
      <BandeInfos />
      <Promotions plats={promotions} />
      <TuilesCategories carte={carte} />
      <CommanderEnLigne />
      <LaMarque nombreRestaurants={restaurants.length} />
      {/* Bloc qui suit un bloc : haut resserré (maquette, CSS 410). */}
      <SectionRestaurants className="pt-3 lg:pt-4" restaurants={restaurants} />
      <VosAvantages config={fidelite} offres={offres} />
      <BlocAvis avis={avis} />
      <BlocAppli />
    </>
  );
}
