import type {
  ICategorieCarte,
  IPlatCarte,
} from "@/features/menus/types/carte.types";

import { CHEMIN_CARTE, ID_MENU, adresseAbsolue } from "./commun";

import { CLE_PROMOTIONS } from "@/features/menus/carte.categories";
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
    // Photo recadrée du site ou photo de l'API ; jamais le logo de repli
    // d'un plat sans photo (49 × 69 px), comme le sitemap.
    ...(plat.photo.recadree || /^https?:\/\//.test(plat.photo.src)
      ? { image: adresseAbsolue(plat.photo.src) }
      : {}),
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
    // Pas de section Promotions : ses plats figurent déjà dans leur catégorie.
    hasMenuSection: categories
      .filter((c) => c.cle !== CLE_PROMOTIONS)
      .map((c) => ({
        "@type": "MenuSection",
        name: c.nom,
        url: adresseAbsolue(`${CHEMIN_CARTE}#${c.cle}`),
        hasMenuItem: c.plats.map(menuItemSchemaOrg),
      })),
  };
}
