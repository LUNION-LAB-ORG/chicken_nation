import type { IRestaurantPublic } from "./restaurant.type";

import { slugifier } from "@/lib/seo/slug";

/**
 * Restaurants tels que le site les présente : adresse de la page
 * (`/fr/restaurants/<slug>`), nom affiché avec ses accents (la base les
 * enregistre en capitales sans accent) et commune (JSON-LD).
 *
 * Le slug est tiré du nom de l'API, jamais de l'identifiant : les
 * identifiants diffèrent entre la base de test et la production.
 * Un restaurant absent de la table garde le nom de l'API, mis en forme,
 * et la ville « Abidjan » pour seule localité.
 */

interface IFicheSite {
  nom: string;
  commune: string;
  /** Adresse affichée quand celle de la base est peu lisible (capitales, abréviations). */
  adresse?: string;
}

/** Dans l'ordre d'affichage (celui du pied de page de la maquette). */
const TABLE: [slug: string, fiche: IFicheSite][] = [
  ["zone-4", { nom: "Marcory Zone 4", commune: "Marcory" }],
  ["angre", { nom: "Angré", commune: "Cocody" }],
  [
    "sococe-2-plateaux",
    {
      nom: "Sococé 2 Plateaux",
      commune: "Cocody",
      adresse: "Centre commercial Sococé, boulevard des Martyrs",
    },
  ],
  ["faya", { nom: "Riviera Faya", commune: "Cocody" }],
  ["yopougon", { nom: "Yopougon", commune: "Yopougon" }],
];

export interface IRestaurantSite extends IRestaurantPublic {
  slug: string;
  /** « Angré », « Marcory Zone 4 » ; le titre de la page est « Chicken Nation {nomAffiche} ». */
  nomAffiche: string;
  /** Commune d'Abidjan, `null` pour un restaurant absent de la table. */
  commune: string | null;
  /** Adresse sans « , Abidjan, Côte d'Ivoire », ou `null` si la base n'en a pas. */
  adresseCourte: string | null;
}

/** « CHICKEN NATION SOCOCE 2 PLATEAUX » → « sococe-2-plateaux ». */
export const slugRestaurant = (nomApi: string) =>
  slugifier(String(nomApi ?? "").replace(/^\s*chicken\s+nation\b/i, ""));

/** Chemin de la page d'un restaurant. */
export const cheminRestaurant = (r: Pick<IRestaurantSite, "slug">) =>
  `/fr/restaurants/${r.slug}`;

// « CHICKEN NATION ABOBO PK 18 » → « Abobo Pk 18 » (repli pour un restaurant hors table).
function nomDepuisApi(nomApi: string) {
  return String(nomApi ?? "")
    .replace(/^\s*chicken\s+nation\b/i, "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
    .join(" ");
}

/** « 2762 Avenue Antonin Dioulo, Abidjan, Côte d'Ivoire » → « 2762 Avenue Antonin Dioulo ». */
export function adresseCourte(
  adresse: string | null | undefined,
): string | null {
  const a = String(adresse ?? "")
    .replace(/,?\s*Abidjan\s*(,\s*C[ôo]te d['’]Ivoire)?\s*$/i, "")
    .replace(/,?\s*C[ôo]te d['’]Ivoire\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return a || null;
}

/** Restaurant enrichi des informations du site. */
export function restaurantDuSite(r: IRestaurantPublic): IRestaurantSite {
  const slug =
    slugRestaurant(r.name) ||
    `restaurant-${String(r.id).slice(0, 6).toLowerCase()}`;
  const fiche = TABLE.find(([s]) => s === slug)?.[1];

  return {
    ...r,
    slug,
    nomAffiche: fiche?.nom ?? (nomDepuisApi(r.name) || "Chicken Nation"),
    commune: fiche?.commune ?? null,
    adresseCourte: fiche?.adresse ?? adresseCourte(r.address),
  };
}

const rang = (slug: string) => {
  const i = TABLE.findIndex(([s]) => s === slug);

  return i === -1 ? TABLE.length : i;
};

/**
 * Restaurants du site, dans l'ordre de la table (les inconnus ensuite, par
 * nom). Deux restaurants au même slug (deux noms identiques dans la base) :
 * le second prend le suffixe « -2 », pour que chaque page ait sa propre adresse.
 */
export function restaurantsDuSite(
  restaurants: readonly IRestaurantPublic[],
): IRestaurantSite[] {
  const pris = new Set<string>();

  return restaurants
    .map(restaurantDuSite)
    .sort(
      (a, b) =>
        rang(a.slug) - rang(b.slug) ||
        a.nomAffiche.localeCompare(b.nomAffiche, "fr"),
    )
    .map((r) => {
      let slug = r.slug;

      for (let n = 2; pris.has(slug); n++) slug = `${r.slug}-${n}`;
      pris.add(slug);

      return slug === r.slug ? r : { ...r, slug };
    });
}

/** Restaurant d'une adresse `/fr/restaurants/<slug>`, ou `null`. */
export function trouverRestaurant<T extends Pick<IRestaurantSite, "slug">>(
  restaurants: readonly T[],
  slug: string,
): T | null {
  const cherche = String(slug ?? "").toLowerCase();

  return restaurants.find((r) => r.slug === cherche) ?? null;
}
