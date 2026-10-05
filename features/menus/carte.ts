import type {
  ICategorieCarte,
  IPlatApi,
  IPlatCarte,
} from "./types/carte.types";

import {
  CATEGORIES_SITE,
  CLE_PROMOTIONS,
  categorieDuSite,
  comparerCategories,
  nomComparable,
  type ICategorieSite,
} from "./carte.categories";
import { IMAGE_DEFAUT_PLAT, photoPlat } from "./photo-plat";
import { slugPlat } from "./plats.slug";

import { formatImageUrl } from "@/utils/formatImageUrl";

/**
 * Construction de la carte publique à partir de `GET /dishes` (fonctions
 * pures, sans appel réseau : la lecture et le cache sont dans
 * `apis/menu-public.api.ts`).
 */

const HEURE = /^\d{1,2}:\d{2}$/;

/**
 * Créneau horaire du plat, ou `null` s'il est servi toute la journée.
 * Même lecture que le serveur (platDisponibleMaintenant) : créneau absent,
 * illisible ou de durée nulle (00:00 à 00:00) = toujours servi.
 */
function lireCreneau(
  debut?: string | null,
  fin?: string | null,
): IPlatCarte["creneau"] {
  const d = (debut ?? "").trim();
  const f = (fin ?? "").trim();

  if (!HEURE.test(d) || !HEURE.test(f) || d === f) return null;

  return { debut: d, fin: f };
}

/** Même critère que l'application : promotion ET prix promo renseigné, inférieur au prix. */
const enPromotion = (p: IPlatApi) =>
  p.is_promotion && !!p.promotion_price && p.promotion_price < p.price;

/** Plat réduit aux champs affichés ou publiés par le site. */
export function reduirePlat(
  p: IPlatApi,
  categorie: ICategorieSite,
): IPlatCarte {
  const promo = enPromotion(p);
  const nom = p.name.replace(/\s+/g, " ").trim();

  return {
    id: p.id,
    slug: slugPlat({ id: p.id, nom }),
    nom,
    description: (p.description ?? "").replace(/\s+/g, " ").trim(),
    prix: promo ? p.promotion_price! : p.price,
    prixAvantPromo: promo ? p.price : null,
    image: formatImageUrl(p.image ?? undefined, IMAGE_DEFAUT_PLAT),
    photo: photoPlat(p.id, p.image),
    categorie: {
      cle: categorie.cle,
      nom: categorie.libelle,
      court: categorie.court,
    },
    modes: Array.isArray(p.available_order_types)
      ? p.available_order_types
      : [],
    creneau: lireCreneau(p.available_from, p.available_until),
    composable: p.composable === true,
    modifieLe: p.updated_at ?? null,
  };
}

// Prix croissant, puis nom : un ordre stable d'une construction à l'autre.
const parPrix = (a: IPlatCarte, b: IPlatCarte) =>
  a.prix - b.prix || a.nom.localeCompare(b.nom, "fr");

/**
 * Carte rangée par catégorie, dans l'ordre de la table du site.
 *
 * Seuls les plats actifs et rangés dans une catégorie sont gardés. La section
 * Promotions réunit tous les plats en promotion, quelle que soit leur
 * catégorie (ils restent aussi dans la leur), et les plats de la catégorie
 * PROMOTIONS de la base ; elle disparaît s'il n'y en a aucun.
 */
export function construireCarte(
  platsApi: readonly IPlatApi[],
): ICategorieCarte[] {
  const groupes = new Map<
    string,
    { categorie: ICategorieSite; plats: IPlatCarte[] }
  >();
  const promotions = new Map<string, IPlatCarte>();

  for (const p of platsApi) {
    if (!p || p.entity_status !== "ACTIVE" || !p.category?.name) continue;
    const categorie = categorieDuSite(p.category.name);
    const plat = reduirePlat(p, categorie);

    if (categorie.cle === CLE_PROMOTIONS || plat.prixAvantPromo !== null)
      promotions.set(plat.id, plat);
    if (categorie.cle === CLE_PROMOTIONS) continue;
    const groupe = groupes.get(categorie.cle) ?? { categorie, plats: [] };

    groupe.plats.push(plat);
    groupes.set(categorie.cle, groupe);
  }

  if (promotions.size > 0) {
    groupes.set(CLE_PROMOTIONS, {
      categorie: categorieDuSite("PROMOTIONS"),
      plats: Array.from(promotions.values()),
    });
  }

  return Array.from(groupes.values())
    .sort((a, b) => comparerCategories(a.categorie, b.categorie))
    .map(({ categorie, plats }) => ({
      cle: categorie.cle,
      nom: categorie.libelle,
      court: categorie.court,
      plats: plats.sort(parPrix),
    }));
}

/** Tous les plats de la carte, une seule fois chacun (un plat en promotion figure dans deux sections). */
export function platsDeLaCarte(
  carte: readonly ICategorieCarte[],
): IPlatCarte[] {
  const vus = new Map<string, IPlatCarte>();

  for (const c of carte)
    for (const p of c.plats) if (!vus.has(p.id)) vus.set(p.id, p);

  return Array.from(vus.values());
}

/**
 * Plat qui illustre une catégorie (tuiles de l'accueil) : celui de la table
 * s'il est à la carte, sinon le premier qui a une photo recadrée, sinon le premier.
 */
export function platVitrine(categorie: ICategorieCarte): IPlatCarte | null {
  const vitrine =
    CATEGORIES_SITE.find((c) => c.cle === categorie.cle)?.vitrine ?? null;
  const choisi = vitrine
    ? categorie.plats.find(
        (p) => nomComparable(p.nom) === nomComparable(vitrine),
      )
    : undefined;

  return (
    choisi ??
    categorie.plats.find((p) => p.photo.recadree) ??
    categorie.plats[0] ??
    null
  );
}

/**
 * « Promotion du moment » de l'accueil : le plat en promotion qui a la plus
 * forte remise en francs ; à égalité, le plus cher. `null` s'il n'y en a aucun
 * (l'étiquette est alors masquée).
 */
export function platEnVedette(
  carte: readonly ICategorieCarte[],
): IPlatCarte | null {
  let vedette: IPlatCarte | null = null;

  for (const p of platsDeLaCarte(carte)) {
    if (p.prixAvantPromo === null) continue;
    if (!vedette) {
      vedette = p;
      continue;
    }
    const remise = p.prixAvantPromo - p.prix;
    const remiseVedette = vedette.prixAvantPromo! - vedette.prix;

    if (
      remise > remiseVedette ||
      (remise === remiseVedette && p.prix > vedette.prix)
    )
      vedette = p;
  }

  return vedette;
}

/** Prix le plus bas et le plus haut de la carte (fourchette de prix du JSON-LD), ou `null` si elle est vide. */
export function fourchettePrix(
  carte: readonly ICategorieCarte[],
): { min: number; max: number } | null {
  const prix = platsDeLaCarte(carte).map((p) => p.prix);

  return prix.length
    ? { min: Math.min(...prix), max: Math.max(...prix) }
    : null;
}

/** Plat vendu seulement à emporter (ou sur place) : pas de mode DELIVERY. Liste vide = vendu partout. */
export const aEmporterUniquement = (plat: Pick<IPlatCarte, "modes">) =>
  plat.modes.length > 0 && !plat.modes.includes("DELIVERY");
