import {
  CHEMIN_CARTE,
  ID_ORGANISATION,
  TELEPHONE_SCHEMA,
  adresseAbsolue,
} from "./commun";

import {
  lireHoraires,
  regrouperHoraires,
} from "@/features/restaurants/horaires";
import {
  cheminRestaurant,
  type IRestaurantSite,
} from "@/features/restaurants/restaurants.site";
import { formatImageUrl } from "@/utils/formatImageUrl";

/**
 * Données structurées des restaurants (schema.org `Restaurant`), une par page
 * `/fr/restaurants/<slug>`, et la liste (`ItemList`) de `/fr/restaurants`.
 *
 * Seul numéro publié : le 27 21 71 21 30 (retouche 6), jamais celui du
 * restaurant. Jamais d'`aggregateRating` ni de `Review`.
 */

const JOURS_SCHEMA = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/** Identifiant stable du nœud d'un restaurant. */
export const idRestaurant = (r: Pick<IRestaurantSite, "slug">) =>
  `${adresseAbsolue(cheminRestaurant(r))}#restaurant`;

/** Fourchette de prix lisible (`priceRange`) : « 2 000 à 22 000 FCFA ». */
export function fourchetteTexte(prix: { min: number; max: number }): string {
  const n = (x: number) =>
    String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return prix.min === prix.max
    ? `${n(prix.min)} FCFA`
    : `${n(prix.min)} à ${n(prix.max)} FCFA`;
}

/** Horaires de la semaine : un bloc par groupe de jours et par plage (une fermeture après minuit est permise). */
export function horairesSchemaOrg(schedule: string | null) {
  return regrouperHoraires(lireHoraires(schedule)).flatMap(
    ({ jours, plages }) =>
      plages.map((p) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: jours.map((j) => `https://schema.org/${JOURS_SCHEMA[j]}`),
        opens: p.ouverture,
        closes: p.fermeture,
      })),
  );
}

/**
 * Nœud `Restaurant` d'une page restaurant.
 * `prix` : fourchette des prix de la carte (`fourchettePrix` de features/menus/carte.ts).
 */
export function restaurantSchemaOrg(
  r: IRestaurantSite,
  options: { prix?: { min: number; max: number } | null } = {},
) {
  const url = adresseAbsolue(cheminRestaurant(r));
  const horaires = horairesSchemaOrg(r.schedule);

  return {
    "@type": "Restaurant",
    "@id": idRestaurant(r),
    name: `CHICKEN NATION ${r.nomAffiche}`,
    url,
    ...(r.image ? { image: adresseAbsolue(formatImageUrl(r.image)) } : {}),
    ...(r.adresseCourte
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: r.adresseCourte,
            addressLocality: r.commune ?? "Abidjan",
            addressRegion: "Abidjan",
            addressCountry: "CI",
          },
        }
      : {}),
    ...(r.latitude != null && r.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: r.latitude,
            longitude: r.longitude,
          },
        }
      : {}),
    telephone: TELEPHONE_SCHEMA,
    ...(options.prix ? { priceRange: fourchetteTexte(options.prix) } : {}),
    servesCuisine: ["Fast-food", "Poulet frit", "Burgers"],
    ...(horaires.length ? { openingHoursSpecification: horaires } : {}),
    // L'adresse de la carte (le nœud Menu n'est publié que sur /fr/carte :
    // un @id seul ne se résolvait pas ici). `menu` est l'ancien nom de hasMenu.
    hasMenu: adresseAbsolue(CHEMIN_CARTE),
    // Commande en ligne : la carte du site, le restaurant se choisit à la caisse.
    // Pas de deliveryMethod : une partie des livraisons passe par Turbo.
    potentialAction: {
      "@type": "OrderAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: adresseAbsolue(CHEMIN_CARTE),
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
    },
    parentOrganization: { "@id": ID_ORGANISATION },
  };
}

/** Bloc JSON-LD complet d'une page restaurant. */
export function pageRestaurantSchemaOrg(
  r: IRestaurantSite,
  options: { prix?: { min: number; max: number } | null } = {},
) {
  return {
    "@context": "https://schema.org",
    ...restaurantSchemaOrg(r, options),
  };
}

/** Liste des pages restaurants (`/fr/restaurants`). */
export function listeRestaurantsSchemaOrg(
  restaurants: readonly IRestaurantSite[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Les restaurants CHICKEN NATION à Abidjan",
    numberOfItems: restaurants.length,
    itemListElement: restaurants.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `CHICKEN NATION ${r.nomAffiche}`,
      url: adresseAbsolue(cheminRestaurant(r)),
    })),
  };
}
