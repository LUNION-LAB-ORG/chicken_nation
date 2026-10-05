import type {
  IAdresseLivraison,
  ICreationCommande,
  ILignePanier,
  ModeCommande,
} from "../types/commande.types";

import { signaturePanier } from "./panier.utils";

import { INSECABLE } from "@/lib/typo";

/**
 * Règles de la caisse en 5 étapes (Panier, Connexion, Livraison ou retrait,
 * Avantages, Paiement), sans écran : l'étape la plus avancée où le client
 * peut aller, ce qui l'empêche d'aller plus loin, et la réutilisation d'une
 * commande créée mais pas encore payée. Les règles sont celles du site
 * (Panier.tsx), la maquette ne donne que l'écran.
 */

export type EtapeCaisse = 1 | 2 | 3 | 4 | 5;

export const ETAPES_CAISSE: readonly {
  numero: EtapeCaisse;
  libelle: string;
}[] = [
  { numero: 1, libelle: "Panier" },
  { numero: 2, libelle: "Connexion" },
  { numero: 3, libelle: "Livraison ou retrait" },
  { numero: 4, libelle: "Avantages" },
  { numero: 5, libelle: "Paiement" },
];

// ── Livraison ou retrait ──────────────────────────────────────────────────

/** Restaurant de retrait tel que la caisse l'évalue au moment présent. */
export interface IRetraitEvalue {
  /** Ouvert maintenant (plageOuverte, règle du serveur). */
  ouvert: boolean;
  /** Plats et cadeaux du panier que ce restaurant ne propose pas. */
  absents: string[];
  /** Heures de retrait proposées (creneauxRetrait). */
  creneaux: Date[];
}

export interface IEtatLivraison {
  mode: ModeCommande;
  /** Livraison ouverte (réglage « delivery.app_disabled » du back office). */
  livraisonOuverte: boolean;
  adresse: IAdresseLivraison | null;
  /** Frais connus pour cette adresse : calcul fini et sans erreur. */
  fraisConnus: boolean;
  /** Articles du panier qui ne se vendent pas dans le mode choisi (articlesHorsMode). */
  horsMode: string[];
  /** Restaurant de retrait choisi, évalué ; null si aucun. */
  retrait: IRetraitEvalue | null;
  /** Heure de retrait (ISO d'un créneau), null = dès que possible. */
  heure: string | null;
}

/**
 * Ce qui empêche de passer l'étape « Livraison ou retrait », en une phrase, ou
 * null si tout est prêt. Mêmes contrôles que le bouton de commande du site :
 * le serveur refuserait la commande sinon.
 */
export function obstacleLivraison(e: IEtatLivraison): string | null {
  if (e.mode === "DELIVERY") {
    if (!e.livraisonOuverte)
      return `La livraison est momentanément indisponible${INSECABLE}: passez en retrait.`;
    if (e.horsMode.length)
      return "Passez en retrait ou retirez les articles à emporter pour continuer.";
    if (!e.adresse)
      return "Choisissez une adresse de livraison pour continuer.";
    if (!e.fraisConnus)
      return "Les frais de livraison de cette adresse ne sont pas encore connus.";

    return null;
  }
  if (e.horsMode.length)
    return "Passez en livraison ou retirez les articles vendus en livraison uniquement.";
  if (!e.retrait) return "Choisissez un restaurant ouvert pour continuer.";
  if (!e.retrait.ouvert)
    return `Ce restaurant est fermé en ce moment${INSECABLE}: choisissez un restaurant ouvert.`;
  if (e.retrait.absents.length) {
    return `Ce restaurant ne propose pas${INSECABLE}: ${e.retrait.absents.join(", ")}. Choisissez-en un autre.`;
  }
  if (
    e.heure !== null &&
    !e.retrait.creneaux.some((d) => d.toISOString() === e.heure)
  ) {
    return "Choisissez une heure de retrait pour continuer.";
  }

  return null;
}

export const livraisonPrete = (e: IEtatLivraison) =>
  obstacleLivraison(e) === null;

// ── Étape la plus avancée ─────────────────────────────────────────────────

export interface IEtatCaisse {
  /**
   * Panier prêt : au moins un plat à commander, relecture du catalogue
   * finie, aucune ligne à recomposer ni hors de son créneau horaire.
   */
  panierPret: boolean;
  /** Client connecté, prénom et nom connus (sinon la commande partirait au nom de « null null »). */
  connecte: boolean;
  /** Étape « Livraison ou retrait » prête (livraisonPrete). */
  livraisonPrete: boolean;
  /** Cadeaux choisis acceptés par le serveur, et épicé ou non choisi pour chaque plat offert qui le demande. */
  avantagesPrets: boolean;
}

/**
 * Étape la plus avancée où le client peut aller : les pilules des étapes sont
 * cliquables jusqu'à celle-ci, et une étape plus loin (adresse partagée,
 * retour arrière) ramène ici.
 */
export function etapeMaximale(e: IEtatCaisse): EtapeCaisse {
  if (!e.panierPret) return 1;
  if (!e.connecte) return 2;
  if (!e.livraisonPrete) return 3;
  if (!e.avantagesPrets) return 4;

  return 5;
}

/** Étape demandée ramenée à ce qui est possible (entre 1 et l'étape la plus avancée). */
export function etapeAccessible(demandee: number, e: IEtatCaisse): EtapeCaisse {
  const max = etapeMaximale(e);
  const n = Number.isInteger(demandee) ? demandee : 1;

  return Math.max(1, Math.min(max, n)) as EtapeCaisse;
}

// ── Commande créée, pas encore payée ──────────────────────────────────────

/**
 * Empreinte de tout ce qui fait le contenu et le prix d'une commande : plats,
 * choix et quantités, mode, adresse et repère, restaurant, heure, code,
 * points, cadeaux et leur épicé. Deux clics « Payer » sur la même empreinte
 * paient la même commande.
 */
export function signatureCommande(c: ICreationCommande): string {
  const adresse =
    c.mode === "DELIVERY" && c.adresse
      ? [
          c.adresse.latitude.toFixed(6),
          c.adresse.longitude.toFixed(6),
          c.adresse.libelle,
          c.adresse.repere.trim(),
        ]
      : null;
  const cadeaux = (c.cadeaux ?? [])
    .map((x) => `${x.id}:${x.epice === true ? "epice" : "nature"}`)
    .sort()
    .join(",");

  return JSON.stringify({
    mode: c.mode,
    panier: signaturePanier(c.lignes),
    adresse,
    restaurant: c.mode === "PICKUP" ? c.restaurantId : null,
    heure: c.mode === "PICKUP" ? c.heureRetrait : null,
    code: c.code ?? null,
    points: c.points ?? 0,
    cadeaux,
  });
}

/**
 * Au clic « Payer » :
 *  - `creer` : aucune commande non payée dans cet onglet ;
 *  - `reutiliser` : la commande non payée correspond au panier, on rouvre le
 *    paiement de CELLE-CI (aucune seconde commande) ;
 *  - `remplacer` : le panier a changé depuis, la commande non payée est
 *    annulée (annulerCommandeAction) avant d'en créer une nouvelle.
 * La caisse relit la commande avant de la réutiliser : payée entre-temps, elle
 * mène au suivi.
 */
export function decisionPaiement(
  enAttente: { signature: string } | null,
  signature: string,
): "creer" | "reutiliser" | "remplacer" {
  if (!enAttente) return "creer";

  return enAttente.signature === signature ? "reutiliser" : "remplacer";
}

/**
 * Le panier est-il encore celui de la commande dont voici la signature
 * (signatureCommande) ? Sert à vider le panier quand cette commande est
 * payée hors de la caisse (page de suivi), sans toucher à un panier refait
 * depuis. Signature illisible (autre version du site) : non.
 */
export function panierDeLaCommande(
  signature: string,
  lignes: ILignePanier[],
): boolean {
  try {
    const panier = (JSON.parse(signature) as { panier?: unknown }).panier;

    return typeof panier === "string" && panier === signaturePanier(lignes);
  } catch {
    return false;
  }
}
