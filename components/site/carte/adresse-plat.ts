import type {
  ICategorieCarte,
  IPlatCarte,
} from "@/features/menus/types/carte.types";

import { platsDeLaCarte } from "@/features/menus/carte";
import { cheminPlat, resoudreSlugPlat } from "@/features/menus/plats.slug";
import { CHEMIN_CARTE } from "@/lib/seo/commun";

/**
 * Ce que sert l'adresse `/fr/carte/<slug>` : la page du plat, ou une
 * redirection permanente (308).
 *
 * - adresse exacte : la page ;
 * - bon plat sous une autre forme (nom modifié au backoffice, capitales,
 *   caractères encodés) : la seule adresse du plat ;
 * - plat retiré : la carte, pour que les liens partagés mènent quelque part ;
 * - adresse sans suffixe de plat : la section de la carte si l'adresse est le
 *   nom d'une catégorie (`/fr/carte/burgers` → `/fr/carte#burgers`), sinon la
 *   carte. Pas de notFound() ici : appelé depuis une page, Next répond bien
 *   404 mais avec un document vide (`<html id="__next_error__">`), sans
 *   en-tête ni texte (vérifié sur :3057 ; lot L8 : 404 anglaise par défaut
 *   en production).
 */
export type DestinationPlat =
  | { type: "page"; plat: IPlatCarte }
  | { type: "redirection"; chemin: string };

// Adresse reçue encodée ou non ; une séquence « % » invalide reste telle quelle.
function decoder(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function destinationPlat(
  slug: string,
  carte: readonly ICategorieCarte[],
): DestinationPlat {
  const resolution = resoudreSlugPlat(slug, platsDeLaCarte(carte));

  switch (resolution.type) {
    case "trouve":
      return decoder(slug) === resolution.plat.slug
        ? { type: "page", plat: resolution.plat }
        : { type: "redirection", chemin: cheminPlat(resolution.plat) };
    case "redirection":
      return { type: "redirection", chemin: cheminPlat(resolution.plat) };
    case "retire":
      return { type: "redirection", chemin: CHEMIN_CARTE };
    default: {
      const cle = decoder(slug).toLowerCase();
      const categorie = carte.find((c) => c.cle === cle);

      return {
        type: "redirection",
        chemin: categorie ? `${CHEMIN_CARTE}#${categorie.cle}` : CHEMIN_CARTE,
      };
    }
  }
}
