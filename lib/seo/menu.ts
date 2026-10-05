import type {
  ICategorieCarte,
  IPlatCarte,
} from "@/features/menus/types/carte.types";

import { CHEMIN_CARTE, ID_MENU, adresseAbsolue } from "./commun";

import { cheminPlat } from "@/features/menus/plats.slug";

/**
 * Données structurées de la carte (schema.org `Menu`), publiées sur `/fr/carte`.
 * Le « 100 % halal » est une affirmation déjà publiée par le client
 * (`suitableForDiet: HalalDiet`). Jamais d'`aggregateRating` ni de `Review`.
 */

/** Un plat de la carte (`MenuItem`), avec l'adresse de sa page. */
export function menuItemSchemaOrg(plat: IPlatCarte) {
  return {
    "@type": "MenuItem",
    name: plat.nom,
    url: adresseAbsolue(cheminPlat(plat)),
    ...(plat.description ? { description: plat.description } : {}),
    image: adresseAbsolue(plat.photo.src),
    suitableForDiet: "https://schema.org/HalalDiet",
    offers: {
      "@type": "Offer",
      price: plat.prix,
      priceCurrency: "XOF",
      url: adresseAbsolue(cheminPlat(plat)),
    },
  };
}

/**
 * Carte entière : une `MenuSection` par catégorie, avec l'ancre de sa section.
 * `@id` stable, repris par le `hasMenu` des pages restaurants.
 */
export function menuSchemaOrg(categories: readonly ICategorieCarte[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": ID_MENU,
    name: "La carte CHICKEN NATION",
    url: adresseAbsolue(CHEMIN_CARTE),
    inLanguage: "fr",
    hasMenuSection: categories.map((c) => ({
      "@type": "MenuSection",
      name: c.nom,
      url: adresseAbsolue(`${CHEMIN_CARTE}#${c.cle}`),
      hasMenuItem: c.plats.map(menuItemSchemaOrg),
    })),
  };
}
