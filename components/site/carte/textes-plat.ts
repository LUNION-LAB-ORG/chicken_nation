import type { IPlatCarte } from "@/features/menus/types/carte.types";

import { fcfa, phrase, typo } from "@/lib/typo";

/**
 * Titre et description des pages plats (plan, section 5.1) : titre de
 * 60 caractères au plus avec le gabarit « | CHICKEN NATION », description de
 * 155 au plus.
 */

const GABARIT = " | CHICKEN NATION";

export const TITRE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/** Description de la base mise en forme (phrase, insécables), sans point final. */
export const descriptionLisible = (description: string) =>
  typo(phrase(description)).replace(/[\s.]+$/, "");

/**
 * « BOX DE LA NATION, box à Abidjan », raccourci si le titre complet (avec
 * le gabarit) dépasse 60 caractères : d'abord sans la catégorie, puis le nom seul.
 */
export function titrePlat(plat: Pick<IPlatCarte, "nom" | "categorie">) {
  const court = plat.categorie.court.toLocaleLowerCase("fr");
  const essais = [
    `${plat.nom}, ${court} à Abidjan`,
    `${plat.nom} à Abidjan`,
    plat.nom,
  ];

  return essais.find((t) => t.length + GABARIT.length <= TITRE_MAX) ?? plat.nom;
}

/**
 * « {description}. {prix} FCFA. Livraison dans le Grand Abidjan ou retrait
 * dans nos restaurants. » La description est coupée à un mot entier (avec
 * « … ») si l'ensemble dépasse 155 caractères ; sans description, le nom et
 * la catégorie la remplacent.
 */
export function descriptionPlat(
  plat: Pick<IPlatCarte, "nom" | "description" | "prix" | "categorie">,
) {
  const fin = `${fcfa(plat.prix)}. Livraison dans le Grand Abidjan ou retrait dans nos restaurants.`;
  const debut = plat.description
    ? descriptionLisible(plat.description)
    : `${plat.nom}, ${plat.categorie.court.toLocaleLowerCase("fr")}`;
  const entier = `${debut}. ${fin}`;

  if (entier.length <= DESCRIPTION_MAX) return entier;
  // Place laissée au début, « … » et l'espace compris.
  const place = DESCRIPTION_MAX - fin.length - 2;
  const coupe = debut.slice(0, place + 1);
  const dernierMot = coupe.lastIndexOf(" ");
  const tronque = (
    dernierMot > 0 ? coupe.slice(0, dernierMot) : coupe.slice(0, place)
  ).replace(/[\s,;:(+.-]+$/, "");

  return `${tronque}… ${fin}`;
}
