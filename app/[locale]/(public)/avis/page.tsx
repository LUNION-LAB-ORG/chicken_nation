import type { StoreAvis } from "@/features/avis/types/avis.types";

import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../meta";

import Image from "@/components/site/Image";
import { ParcoursAvis } from "@/features/avis/components/ParcoursAvis";
import {
  ALT_MASCOTTE,
  CHEMIN_AVIS,
  DESCRIPTION_PAGE_AVIS,
  TITRE_PAGE_AVIS,
} from "@/features/avis/utils/textes-avis";
import { obtenirRestaurantsDuSite } from "@/features/restaurants/restaurant.api";

// Statique, reconstruite au plus toutes les heures (stores lus dans l'API).
export const revalidate = 3600;

/**
 * « Ton avis compte » : adresse imposée par le client, /fr/avis (lien du QR
 * code : /fr/avis?source=marque-page). /avis sans langue part vers /fr/avis
 * comme les autres pages (proxy.ts) ; rien d'autre n'occupe cette adresse.
 */
export const metadata = pageMetadata({
  chemin: CHEMIN_AVIS,
  titre: TITRE_PAGE_AVIS,
  description: DESCRIPTION_PAGE_AVIS,
});

/**
 * Stores proposés : restaurants actifs de l'API, dans l'ordre du site. API en
 * panne : liste vide, le formulaire reste utilisable avec « Je ne sais pas ».
 */
async function storesDeLaPage(): Promise<StoreAvis[]> {
  try {
    return (await obtenirRestaurantsDuSite()).map((r) => ({
      id: r.id,
      nom: r.nomAffiche,
    }));
  } catch {
    return [];
  }
}

export default async function Avis({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const stores = await storesDeLaPage();

  return (
    <ParcoursAvis
      mascotte={
        <Image
          alt={ALT_MASCOTTE}
          className="block h-auto w-full"
          height={586}
          // Au-dessus de la ligne de flottaison : pas de chargement différé.
          loading="eager"
          sizes="170px"
          src="/assets/site/champion-blanc.png"
          width={600}
        />
      }
      stores={stores}
    />
  );
}
