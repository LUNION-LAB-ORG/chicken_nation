import { slugifier } from "@/lib/seo/slug";

/**
 * Adresse des pages plats : `/fr/carte/<nom-du-plat>-<6 premiers caractères de l'id>`,
 * par exemple `/fr/carte/box-de-la-nation-5b020e`.
 *
 * Cinq noms existent deux fois en production (HOT CREAMY BEEF, HOT CREAMY
 * POULET, MÉCHANT MÉCHANT, NATION CURRY, PEPPER MAYO BEEF) : le suffixe tiré
 * de l'identifiant les distingue. La page retrouve le plat par ce suffixe,
 * pour qu'un nom modifié au backoffice ne casse pas les liens déjà partagés.
 */

export const LONGUEUR_SUFFIXE = 6;

type PlatAdressable = { id: string; nom: string };

/** Suffixe tiré de l'identifiant : ses 6 premiers caractères, en minuscules. */
export function suffixePlat(id: string): string {
  return String(id)
    .replace(/[^0-9a-z]/gi, "")
    .slice(0, LONGUEUR_SUFFIXE)
    .toLowerCase();
}

/** « BOX DE LA NATION » (id 5b020e13-…) → « box-de-la-nation-5b020e ». */
export function slugPlat(plat: PlatAdressable): string {
  const nom = slugifier(plat.nom) || "plat";

  return `${nom}-${suffixePlat(plat.id)}`;
}

/** Chemin de la page d'un plat. */
export const cheminPlat = (plat: PlatAdressable & { slug?: string }) =>
  `/fr/carte/${plat.slug ?? slugPlat(plat)}`;

// Adresse reçue telle quelle ou encodée ; une séquence « % » invalide ne fait pas planter la page.
function decoder(slug: string): string {
  const s = String(slug ?? "");

  try {
    return decodeURIComponent(s).toLowerCase();
  } catch {
    return s.toLowerCase();
  }
}

/** Suffixe lu à la fin d'une adresse, ou `null` s'il n'a pas la bonne forme. */
export function lireSuffixe(slug: string): string | null {
  const s = decoder(slug);
  const m = s.match(new RegExp(`(?:^|-)([0-9a-z]{${LONGUEUR_SUFFIXE}})$`));

  return m ? m[1] : null;
}

export type ResolutionSlugPlat<T> =
  /** Adresse exacte : afficher la page. */
  | { type: "trouve"; plat: T }
  /** Bon plat, adresse périmée (nom modifié) : redirection permanente vers `slug`. */
  | { type: "redirection"; plat: T; slug: string }
  /** Suffixe lisible mais aucun plat : plat retiré, redirection vers la carte. */
  | { type: "retire" }
  /** Adresse sans suffixe valable : vraie 404. */
  | { type: "illisible" };

/**
 * Retrouve un plat par l'adresse demandée.
 * Si deux plats partageaient un jour le même suffixe (contrôlé par les tests
 * sur la carte de production), l'adresse exacte départage, puis le premier.
 */
export function resoudreSlugPlat<T extends PlatAdressable>(
  slug: string,
  plats: readonly T[],
): ResolutionSlugPlat<T> {
  const suffixe = lireSuffixe(slug);

  if (!suffixe) return { type: "illisible" };
  const candidats = plats.filter((p) => suffixePlat(p.id) === suffixe);

  if (candidats.length === 0) return { type: "retire" };
  const demande = decoder(slug);
  const exact = candidats.find((p) => slugPlat(p) === demande);

  if (exact) return { type: "trouve", plat: exact };
  const plat = candidats[0];

  return { type: "redirection", plat, slug: slugPlat(plat) };
}

/** Suffixes portés par plusieurs plats (doit rester vide). */
export function suffixesEnDouble(plats: readonly PlatAdressable[]): string[] {
  const vus = new Map<string, number>();

  for (const p of plats)
    vus.set(suffixePlat(p.id), (vus.get(suffixePlat(p.id)) ?? 0) + 1);

  return Array.from(vus.entries())
    .filter(([, n]) => n > 1)
    .map(([s]) => s);
}
