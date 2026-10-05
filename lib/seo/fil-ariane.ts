import { adresseAbsolue } from "./commun";

/**
 * Fil d'Ariane (schema.org `BreadcrumbList`) des pages plats, restaurants et
 * histoire. L'accueil est toujours le premier élément : on ne passe que la
 * suite, dans l'ordre (« La carte », « Les burgers », nom du plat).
 */

export interface IEtapeAriane {
  nom: string;
  /** Chemin du site (« /fr/carte#burgers ») ou adresse complète. */
  chemin: string;
}

export const ACCUEIL_ARIANE: IEtapeAriane = { nom: "Accueil", chemin: "/fr" };

export function filArianeSchemaOrg(etapes: readonly IEtapeAriane[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [ACCUEIL_ARIANE, ...etapes].map((etape, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: etape.nom,
      item: adresseAbsolue(etape.chemin),
    })),
  };
}
