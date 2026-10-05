import type {
  CategorieSupplement,
  IGroupeOptions,
  ILignePanier,
  IOptionChoisie,
  IPlatDetail,
  ISupplementPlat,
  ModeCommande,
} from "../types/commande.types";

import {
  commandableEnLigne,
  construireLigne,
  epiceDeLigne,
  mentionModes,
  platDisponibleMaintenant,
  QUANTITE_MAX,
  QUANTITE_SUPPLEMENT_MAX,
  selectionParDefaut,
  totalLigne,
  venduEn,
} from "./panier.utils";

import { heureTexte } from "@/features/restaurants/horaires";
import { INSECABLE, joli, typo } from "@/lib/typo";

/**
 * Règles d'écran de la fiche plat (maquette, JS 545-705). Les règles du
 * panier lui-même (groupes, bornes, construction de la ligne) restent dans
 * panier.utils : la fiche ne fait que les présenter.
 */

/** Plat de la fiche et forme courte de sa catégorie (« Box »), lus en une seule requête. */
export interface IFichePlat {
  plat: IPlatDetail;
  categorie: string | null;
}

/**
 * Choix en cours dans la fiche. `epice` vaut `null` tant que le client n'a
 * pas choisi pour un plat OPTIONAL (choix obligatoire, sans valeur par
 * défaut) ; pour un plat ALWAYS ou NEVER, il suit le plat.
 */
export interface IChoixEnCours {
  epice: boolean | null;
  options: IOptionChoisie[];
  /** Quantité par identifiant de supplément ; zéro ou absent : non pris. */
  supplements: Record<string, number>;
  quantite: number;
}

const borne = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : min;

/**
 * Libellé d'un choix découpé sur « : » (maquette, JS 55-60) :
 * « SAUCE : barbecue ou ketchup » donne le titre « Sauce » et la précision
 * « Barbecue ou ketchup ». Le titre passe par joli() (noms en capitales de
 * la base), la précision par typo().
 */
export function decouperLibelle(label: string): {
  titre: string;
  detail: string;
} {
  const texte = String(label ?? "")
    .replace(/\s+/g, " ")
    .trim();
  const deuxPoints = texte.indexOf(":");
  const titre = joli(
    deuxPoints > 0 ? texte.slice(0, deuxPoints).trim() : texte,
  );
  const reste = deuxPoints > 0 ? texte.slice(deuxPoints + 1).trim() : "";
  const detail = reste
    ? typo(reste.charAt(0).toUpperCase() + reste.slice(1).toLowerCase())
    : "";

  return { titre, detail };
}

/** « Obligatoire · 1 choix », « Facultatif · jusqu'à 2 choix », « Obligatoire · 1 à 3 choix ». */
export function regleGroupe(
  g: Pick<IGroupeOptions, "min_select" | "max_select">,
) {
  const { min_select: min, max_select: max } = g;
  const regle =
    max === 1
      ? "1 choix"
      : min === max
        ? `${max}${INSECABLE}choix`
        : min >= 1
          ? `${min} à ${max}${INSECABLE}choix`
          : `jusqu'à ${max}${INSECABLE}choix`;

  return `${min > 0 ? "Obligatoire" : "Facultatif"} · ${regle}`;
}

/** Message d'un groupe obligatoire laissé incomplet. */
export const messageGroupe = (g: Pick<IGroupeOptions, "min_select">) =>
  g.min_select > 1
    ? `Choisissez au moins ${g.min_select}${INSECABLE}options pour continuer.`
    : "Choisissez une option pour continuer.";

/** Aide d'un groupe à choix multiple dont le maximum est atteint. */
export const aideMaximum = (g: Pick<IGroupeOptions, "max_select">) =>
  `${g.max_select}${INSECABLE}choix au maximum${INSECABLE}: décochez-en un pour changer.`;

/** Groupes dont le minimum n'est pas atteint, dans l'ordre de la fiche. */
export const groupesIncomplets = (
  groupes: IGroupeOptions[],
  options: IOptionChoisie[],
) =>
  groupes.filter(
    (g) => options.filter((o) => o.group_id === g.id).length < g.min_select,
  );

/** Un choix du groupe est-il payant ? Les autres s'affichent alors « Inclus ». */
export const groupePayant = (g: IGroupeOptions) =>
  g.items.some((i) => i.price_delta > 0);

/**
 * Choix de départ de la fiche.
 *  - Nouveau plat : choix par défaut du back office, épicé à choisir
 *    (OPTIONAL) ou imposé, aucun supplément, quantité 1.
 *  - « Modifier » une ligne du panier : ses choix, relus sur le plat tel
 *    qu'il est aujourd'hui (un choix retiré ou indisponible n'est pas repris,
 *    un supplément retiré non plus ; libellés et prix sont ceux du jour).
 */
export function choixInitiaux(
  plat: IPlatDetail,
  ligne?: ILignePanier | null,
): IChoixEnCours {
  const epiceImpose = epiceDeLigne(plat.spice_level, null);

  if (!ligne) {
    return {
      epice: epiceImpose,
      options: selectionParDefaut(plat.groupes),
      supplements: {},
      quantite: 1,
    };
  }

  const repris = new Set(ligne.options.map((o) => o.item_id));
  const options = plat.groupes.flatMap((g) =>
    g.items
      .filter((i) => i.available && repris.has(i.id))
      .slice(0, g.max_select)
      .map((i) => ({
        item_id: i.id,
        group_id: g.id,
        label: i.label,
        price_delta: i.price_delta,
      })),
  );
  const proposes = new Set(plat.supplements.map((s) => s.id));
  const supplements: Record<string, number> = {};

  for (const s of ligne.supplements) {
    const quantite = borne(s.quantite, 0, QUANTITE_SUPPLEMENT_MAX);

    if (proposes.has(s.id) && quantite > 0) supplements[s.id] = quantite;
  }

  return {
    epice: plat.spice_level === "OPTIONAL" ? ligne.epice : epiceImpose,
    options,
    supplements,
    quantite: borne(ligne.quantite, 1, QUANTITE_MAX),
  };
}

/**
 * Ligne ouverte par « Modifier » : à sa place dans le panier, ou retrouvée
 * par sa clé si le panier a changé entre-temps (autre onglet). `null` si elle
 * n'y est plus : la fiche ajoute alors une nouvelle ligne.
 */
export function ligneAModifier(
  lignes: ILignePanier[],
  demande: { platId: string; indexLigne?: number; cleLigne?: string },
): ILignePanier | null {
  if (demande.indexLigne === undefined) return null;
  const aSaPlace = lignes[demande.indexLigne];
  const ligne =
    demande.cleLigne === undefined || aSaPlace?.cle === demande.cleLigne
      ? aSaPlace
      : lignes.find((l) => l.cle === demande.cleLigne);

  return ligne && ligne.dish_id === demande.platId && !ligne.retire
    ? ligne
    : null;
}

/** Ligne de panier tirée des choix en cours (épicé pas encore choisi : non épicé, pour le prix seulement). */
export const ligneDeFiche = (plat: IPlatDetail, choix: IChoixEnCours) =>
  construireLigne(plat, {
    epice: epiceDeLigne(plat.spice_level, choix.epice) ?? false,
    options: choix.options,
    supplements: choix.supplements,
    quantite: choix.quantite,
  });

/** Total en direct du bouton « Ajouter ». */
export const totalFiche = (plat: IPlatDetail, choix: IChoixEnCours) =>
  totalLigne(ligneDeFiche(plat, choix));

/**
 * Ce qui empêche de commander le plat en ligne maintenant, en une phrase, ou
 * `null`. Mêmes règles que le serveur : un plat servi seulement sur place ne
 * se commande pas sur le site ; hors de son créneau horaire, il est refusé.
 */
export function empechementPlat(
  plat: Pick<
    IPlatDetail,
    "available_order_types" | "available_from" | "available_until"
  >,
  maintenant = new Date(),
): string | null {
  if (!commandableEnLigne(plat.available_order_types))
    return `Ce plat est servi seulement au restaurant${INSECABLE}: il ne se commande pas en ligne.`;
  if (
    !platDisponibleMaintenant(
      plat.available_from,
      plat.available_until,
      maintenant,
    )
  )
    return `Ce plat est servi de ${heureTexte(plat.available_from ?? "")} à ${heureTexte(plat.available_until ?? "")}. Revenez à ce moment-là pour le commander.`;

  return null;
}

/** Ordre et titres des suppléments, par catégorie (maquette, JS 98-102). */
const CATEGORIES_SUPPLEMENTS: readonly {
  cle: CategorieSupplement;
  libelle: string;
}[] = [
  { cle: "FOOD", libelle: "Sauces" },
  { cle: "DRINK", libelle: "Boissons" },
  { cle: "ACCESSORY", libelle: "Accompagnements" },
];

/** Suppléments rangés par catégorie (ordre du back office), catégories vides écartées. */
export function supplementsParCategorie(supplements: ISupplementPlat[]) {
  return CATEGORIES_SUPPLEMENTS.map(({ cle, libelle }) => ({
    cle,
    libelle,
    supplements: supplements
      .filter((s) => s.category === cle)
      .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name)),
  })).filter((c) => c.supplements.length > 0);
}

// ── Mode choisi (livraison ou retrait) ────────────────────────────────────

/**
 * Mention d'un plat qui ne se vend pas dans le mode choisi (« À emporter
 * uniquement : ce plat se retire au restaurant »), ou `null`. Le plat
 * s'ajoute quand même : le tiroir propose ensuite de passer en retrait.
 */
export function mentionPlatHorsMode(
  types: string[] | null | undefined,
  mode: ModeCommande,
): string | null {
  if (venduEn(types, mode) || !commandableEnLigne(types)) return null;

  return mode === "DELIVERY"
    ? `À emporter uniquement${INSECABLE}: ce plat se retire au restaurant`
    : `En livraison uniquement${INSECABLE}: ce plat ne se retire pas au restaurant`;
}

/** Mention d'un supplément qui ne se vend pas dans le mode choisi (« À emporter uniquement »), ou `null`. */
export function mentionSupplementHorsMode(
  types: string[] | null | undefined,
  mode: ModeCommande,
): string | null {
  const mention = venduEn(types, mode) ? null : mentionModes(types);

  return mention ? mention.charAt(0).toUpperCase() + mention.slice(1) : null;
}

/** Note sous les suppléments quand certains ne se vendent pas dans ce mode. */
export const noteSupplementsHorsMode = (mode: ModeCommande) =>
  mode === "DELIVERY"
    ? `Les articles signalés ne se livrent pas${INSECABLE}: avec eux, la livraison n'est pas possible.`
    : `Les articles signalés ne se retirent pas au restaurant${INSECABLE}: avec eux, le retrait n'est pas possible.`;

/** Message quand le client prend un tel supplément. */
export const messageSupplementHorsMode = (nom: string, mode: ModeCommande) =>
  `${nom}${INSECABLE}: ${mode === "DELIVERY" ? "la livraison" : "le retrait"} ne sera pas possible avec cet article.`;
