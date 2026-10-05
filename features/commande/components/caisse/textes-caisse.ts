import type {
  ICadeau,
  ILignePanier,
  ModeCommande,
  NiveauEpice,
} from "../../types/commande.types";

import { problemesLigne } from "../../utils/panier.utils";

import { heureTexte } from "@/features/restaurants/horaires";
import { INSECABLE, kmTexte, nombre, pluriel } from "@/lib/typo";

/**
 * Textes et petites règles de la caisse en 5 étapes, sans écran (testés à
 * part). Les règles de fond (étape la plus avancée, obstacles de l'étape
 * Livraison ou retrait, commande non payée réutilisée) sont dans
 * utils/caisse.utils.ts ; ici, ce que l'écran en dit.
 */

const QUART_HEURE = 15 * 60 * 1000;

/** 18 h 15 d'une date (heure d'Abidjan = UTC), « minuit » pour 0 h. */
export function heureCreneau(d: Date): string {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");

  return heureTexte(`${hh}:${mm}`);
}

/** Créneau de retrait en fenêtre de 15 min : « 18 h 15 à 18 h 30 ». */
export const fenetreCreneau = (debut: Date) =>
  `${heureCreneau(debut)} à ${heureCreneau(new Date(debut.getTime() + QUART_HEURE))}`;

/**
 * Ce que le total ne compte pas encore, dans l'ordre où le client le saura :
 * la livraison (adresse à choisir) puis les frais de service (serveur qui
 * ne publie pas son taux).
 */
export function inconnusDuTotal(
  mode: ModeCommande,
  livraison: number | null,
  fraisService: number | null,
): string[] {
  return [
    mode === "DELIVERY" && livraison === null ? "livraison" : null,
    fraisService === null ? "frais de service" : null,
  ].filter((x): x is string => x !== null);
}

/** « Total », « Total hors livraison », « Total hors livraison et frais de service ». */
export const libelleTotal = (inconnus: string[]) =>
  inconnus.length ? `Total hors ${inconnus.join(" et ")}` : "Total";

/**
 * Ce qui empêche de commander une ligne, SAUF le mode : un article vendu
 * seulement à emporter porte déjà sa mention, et l'alerte de l'étape dit
 * quoi faire. Reste ce qu'il faut corriger dans le panier lui-même (plat
 * à recomposer, créneau horaire du plat).
 */
export function problemesSansMode(
  l: ILignePanier,
  mode: ModeCommande,
  maintenant: Date,
): string[] {
  const partout = {
    ...l,
    available_order_types: [],
    supplements: l.supplements.map((s) => ({
      ...s,
      available_order_types: [],
    })),
  };

  return problemesLigne(partout, mode, maintenant);
}

/** Message qui bloque l'étape Panier, ou null. */
export function obstaclePanier(e: {
  aCommander: number;
  lignesBloquees: string[];
}): string | null {
  if (e.aCommander === 0)
    return "Aucun plat de ce panier n'est encore proposé. Ajoutez d'autres plats.";
  if (e.lignesBloquees.length === 1)
    return `Corrigez ou retirez «${INSECABLE}${e.lignesBloquees[0]}${INSECABLE}» pour continuer.`;
  if (e.lignesBloquees.length > 1)
    return "Corrigez ou retirez les plats signalés pour continuer.";

  return null;
}

/**
 * Épicé ou non d'un plat offert : imposé par le plat (ALWAYS, NEVER) ou
 * choisi par le client (OPTIONAL, ou niveau inconnu : on le demande plutôt
 * que de le supposer). `undefined` : choix encore à faire.
 */
export function epiceDuCadeau(
  niveau: NiveauEpice | undefined,
  choix: boolean | undefined,
): boolean | undefined {
  if (niveau === "ALWAYS") return true;
  if (niveau === "NEVER") return false;

  return choix;
}

/** Le client doit choisir épicé ou non pour ce cadeau (plat offert, niveau OPTIONAL ou inconnu). */
export const cadeauDemandeEpice = (
  c: Pick<ICadeau, "type">,
  niveau: NiveauEpice | undefined,
) => c.type === "PLAT" && niveau !== "ALWAYS" && niveau !== "NEVER";

/**
 * Message qui bloque l'étape Avantages, ou null : un cadeau que le serveur
 * refuserait (mode, créneau, plus proposé), puis un plat offert sans
 * « épicé ou non ».
 */
export function obstacleAvantages(e: {
  cadeauxBloques: string[];
  sansEpice: string[];
}): string | null {
  if (e.cadeauxBloques.length)
    return `Retirez le cadeau «${INSECABLE}${e.cadeauxBloques[0]}${INSECABLE}»${INSECABLE}: il ne peut pas être servi avec cette commande.`;
  if (e.sansEpice.length)
    return `Choisissez épicé ou non épicé pour votre ${e.sansEpice[0]} offert.`;

  return null;
}

/** Plafond des points en mots : 50 → « la moitié », 30 → « 30 % ». */
export const textePlafond = (pct: number) =>
  pct === 50 ? "la moitié" : `${nombre(pct)}${INSECABLE}%`;

/**
 * Règles des points, avec les réglages de l'API (aucun chiffre écrit en dur) :
 * « 1 point = 20 FCFA. À partir de 100 points, et au plus la moitié du prix
 * des plats. Valables 365 jours. »
 */
export function reglesPoints(r: {
  valeurPointTexte: string;
  minimum: number;
  plafondPct: number;
  joursValidite: number | null;
}): string {
  const plafond =
    r.plafondPct > 0 && r.plafondPct < 100
      ? `au plus ${textePlafond(r.plafondPct)} du prix des plats`
      : "";
  const conditions = [
    r.minimum >= 1
      ? `À partir de ${pluriel(r.minimum, "point", "points")}`
      : "",
    plafond,
  ].filter(Boolean);
  const phraseConditions = conditions.length
    ? ` ${conditions.join(", et ").replace(/^au/, "Au")}.`
    : "";
  const validite = r.joursValidite
    ? ` Valables ${nombre(r.joursValidite)}${INSECABLE}jours.`
    : "";

  return `1${INSECABLE}point = ${r.valeurPointTexte}.${phraseConditions}${validite}`;
}

/** « Préparée au restaurant Marcory Zone 4, à 3,1 km » (sans distance si elle est inconnue). */
export const textePreparation = (nom: string, km: number | null) =>
  `Préparée au restaurant ${nom}${km ? `, à ${kmTexte(km)}` : ""}`;
