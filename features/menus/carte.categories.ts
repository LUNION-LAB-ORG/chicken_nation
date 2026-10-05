import { slugifier } from "@/lib/seo/slug";

/**
 * Catégories de la carte telles que le site les présente.
 *
 * L'API trie ses catégories par nom et le compte de `GET /categories` exclut
 * les plats composables : le site ne lit donc jamais cette route. Il regroupe
 * les plats de `GET /dishes` par le nom de leur catégorie et range les groupes
 * selon cette table (ordre et clés de la maquette, JS 81-94).
 *
 * - `cle` : ancre de la section sur la carte (`/fr/carte#box`), jamais modifiée ;
 * - `libelle` : titre de la section ; `court` : forme courte (« Burger ») pour
 *   les titres des pages plats ;
 * - `vitrine` : plat qui illustre la catégorie (tuiles de l'accueil) ;
 * - `nomsApi` : noms de la catégorie dans la base, comparés sans accents ni casse.
 *
 * Une catégorie absente de la table (créée au backoffice) s'affiche après
 * celles-ci, par ordre alphabétique, avec une clé tirée de son nom.
 */
export interface IDefinitionCategorie {
  cle: string;
  libelle: string;
  court: string;
  vitrine: string | null;
  nomsApi: string[];
}

/** Clé de la section qui réunit tous les plats en promotion (et la catégorie PROMOTIONS de la base). */
export const CLE_PROMOTIONS = "promotions";

export const CATEGORIES_SITE: readonly IDefinitionCategorie[] = [
  {
    cle: CLE_PROMOTIONS,
    libelle: "Promotions",
    court: "Promotion",
    vitrine: "GBONHI MAX",
    nomsApi: ["PROMOTIONS"],
  },
  {
    cle: "box",
    libelle: "Nos box",
    court: "Box",
    vitrine: "BOX DE LA NATION",
    nomsApi: ["NOS BOX"],
  },
  {
    cle: "pane",
    libelle: "Poulet pané",
    court: "Poulet pané",
    vitrine: "GBONHI",
    nomsApi: ["POULET PANÉ"],
  },
  {
    cle: "ailes",
    libelle: "Ailes crispy et tenders",
    court: "Ailes et tenders",
    vitrine: "AILES CRISPY 12 PCS",
    nomsApi: ["AILES CRISPY ET TENDERS"],
  },
  {
    cle: "burgers",
    libelle: "Les burgers",
    court: "Burger",
    vitrine: "BURGER PATRON",
    nomsApi: ["LES BURGERS"],
  },
  {
    cle: "sandwichs",
    libelle: "Les sandwichs",
    court: "Sandwich",
    vitrine: "CHICKEN SANDWICH",
    nomsApi: ["LES SANDWICHS"],
  },
  {
    cle: "nuggets",
    libelle: "Les nuggets",
    court: "Nuggets",
    vitrine: "NUGGETS (12 PCS)",
    nomsApi: ["LES NUGGETS"],
  },
  {
    cle: "combos",
    libelle: "Combos",
    court: "Combo",
    vitrine: "FRITE ET COCA",
    nomsApi: ["COMBOS"],
  },
];

/** Catégorie du site rattachée à un plat : table ci-dessus, ou repli pour une catégorie inconnue. */
export interface ICategorieSite {
  cle: string;
  libelle: string;
  court: string;
  vitrine: string | null;
  /** Rang dans la table ; `null` pour une catégorie inconnue (rangée après, par ordre alphabétique). */
  ordre: number | null;
}

/** Comparaison des noms de la base : sans accents, sans casse, espaces réduits. */
export const nomComparable = (nom: string) =>
  String(nom ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

// « TEST BASCULE PAIEMENT » → « Test bascule paiement »
function libelleDepuisNom(nom: string) {
  const bas = nom.replace(/\s+/g, " ").trim().toLowerCase();

  return bas.charAt(0).toUpperCase() + bas.slice(1);
}

/** Catégorie du site pour un nom de catégorie de la base. */
export function categorieDuSite(nomApi: string): ICategorieSite {
  const cherche = nomComparable(nomApi);
  const ordre = CATEGORIES_SITE.findIndex((c) =>
    c.nomsApi.some((n) => nomComparable(n) === cherche),
  );

  if (ordre !== -1) {
    const { cle, libelle, court, vitrine } = CATEGORIES_SITE[ordre];

    return { cle, libelle, court, vitrine, ordre };
  }
  const libelle = libelleDepuisNom(nomApi) || "Autres plats";
  // Une clé déjà prise par la table (« Box » créée à côté de « NOS BOX ») est
  // suffixée pour que deux sections n'aient jamais la même ancre.
  const base = slugifier(nomApi) || "autres";
  const cle = CATEGORIES_SITE.some((c) => c.cle === base) ? `${base}-2` : base;

  return { cle, libelle, court: libelle, vitrine: null, ordre: null };
}

/** Ordre d'affichage : la table d'abord, puis les catégories inconnues par ordre alphabétique. */
export function comparerCategories(
  a: Pick<ICategorieSite, "ordre" | "libelle">,
  b: Pick<ICategorieSite, "ordre" | "libelle">,
): number {
  if (a.ordre !== null && b.ordre !== null) return a.ordre - b.ordre;
  if (a.ordre !== null) return -1;
  if (b.ordre !== null) return 1;

  return a.libelle.localeCompare(b.libelle, "fr");
}
