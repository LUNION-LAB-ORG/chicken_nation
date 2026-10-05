import type {
  ICommande,
  ILignePanier,
  IPlatDetail,
  IReglagesFidelite,
} from "../types/commande.types";
import type { NomIcone } from "@/components/site/Icone";

import { lignePanierDepuisCommande } from "./commande.utils";
import {
  pointsGagnes,
  pointsLisibles,
  soldeUtilisable,
  valeurLisible,
  versCadeau,
} from "./fidelite.utils";
import { versReglagesFidelite } from "./reponses-api.utils";
import { aPayer, etapesSuivi } from "./statut.utils";

import { restaurantDuSite } from "@/features/restaurants/restaurants.site";
import { fcfa, INSECABLE as N, nombre } from "@/lib/typo";

/**
 * Règles d'affichage du suivi d'une commande et de « Mes commandes »
 * (maquette, JS 1376-1490), sans état ni appel : testées à part.
 * Toutes les heures sont celles d'Abidjan (UTC+0), lues en UTC.
 */

type Brut = Record<string, unknown>;

// ── Dates et heures ───────────────────────────────────────────────────────

/** Minutes depuis minuit → « 8 h 05 », « 18 h 30 » (insécables). */
const hhmm = (minutes: number) => {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;

  return `${Math.floor(m / 60)}${N}h${N}${String(m % 60).padStart(2, "0")}`;
};

/** « 2026-10-02T08:17:24Z » → « 8 h 17 », ou null si la date est illisible. */
export function heureDe(iso: string | null | undefined): string | null {
  const d = iso ? new Date(iso) : null;

  if (!d || Number.isNaN(d.getTime())) return null;

  return hhmm(d.getUTCHours() * 60 + d.getUTCMinutes());
}

const MOIS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

const jourUTC = (d: Date) =>
  Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

/**
 * Date d'une commande : « Aujourd'hui, 8 h 17 », « Hier, 21 h 40 »,
 * « 2 oct., 8 h 17 », et l'année si elle n'est pas celle en cours.
 */
export function dateCommande(
  iso: string | null | undefined,
  maintenant = new Date(),
): string {
  const d = iso ? new Date(iso) : null;

  if (!d || Number.isNaN(d.getTime())) return "";
  const heure = heureDe(iso) as string;
  const ecart = Math.round((jourUTC(maintenant) - jourUTC(d)) / 86_400_000);

  if (ecart === 0) return `Aujourd'hui, ${heure}`;
  if (ecart === 1) return `Hier, ${heure}`;
  const annee =
    d.getUTCFullYear() !== maintenant.getUTCFullYear()
      ? `${N}${d.getUTCFullYear()}`
      : "";

  return `${d.getUTCDate()}${N}${MOIS[d.getUTCMonth()]}${annee}, ${heure}`;
}

/**
 * Heure de retrait demandée : « Dès que possible » (la commande porte alors
 * son heure de création, à quelques secondes près) ou « Créneau de 18 h 15
 * à 18 h 30 » (créneaux d'un quart d'heure, retrait.utils). null : en
 * livraison, ou heure inconnue.
 */
export function creneauRetrait(
  c: Pick<ICommande, "type" | "heure" | "created_at">,
): string | null {
  if (c.type !== "PICKUP" || !c.heure || !/^\d{2}:\d{2}$/.test(c.heure))
    return null;
  const [h, m] = c.heure.split(":").map(Number);
  const demandee = h * 60 + m;
  const creee = new Date(c.created_at);

  if (Number.isNaN(creee.getTime())) return null;
  const ecart =
    (demandee - (creee.getUTCHours() * 60 + creee.getUTCMinutes()) + 1440) %
    1440;

  // Le site envoie « maintenant » juste avant que le serveur n'enregistre
  // la commande : la minute peut précéder la création.
  if (ecart <= 5 || ecart >= 1435) return "Dès que possible";

  return `Créneau de ${hhmm(demandee)} à ${hhmm(demandee + 15)}`;
}

// ── État de la commande ───────────────────────────────────────────────────

/** Couleur de la pastille d'état (composant Statut, plus « annulée »). */
export type EtatStatut = "attente" | "cours" | "fini" | "annulee";

export function etatStatut(
  c: Pick<ICommande, "status" | "paied" | "payment_method">,
): EtatStatut {
  if (c.status === "CANCELLED") return "annulee";
  if (c.status === "COMPLETED" || c.status === "COLLECTED") return "fini";
  if (aPayer(c) || c.status === "PENDING") return "attente";

  return "cours";
}

/** Livrée ou récupérée : la frise est terminée. */
export const estServie = (c: Pick<ICommande, "status">) =>
  c.status === "COMPLETED" || c.status === "COLLECTED";

/**
 * « Recommander » : commande servie ou annulée qui a au moins un plat payant
 * (une commande saisie sans ses lignes, ou faite seulement de cadeaux, n'a
 * rien à remettre dans le panier).
 */
export const peutRecommander = (c: Pick<ICommande, "status" | "lignes">) =>
  (estServie(c) || c.status === "CANCELLED") &&
  c.lignes.some((l) => !l.offert && l.quantite > 0);

// ── Frise du suivi ────────────────────────────────────────────────────────

export type EtatEtape = "fait" | "actuel" | "avenir";

export interface IEtapeFrise {
  libelle: string;
  /** Phrase sous le libellé (« Votre commande est en cuisine. »). */
  texte: string;
  icone: NomIcone;
  etat: EtatEtape;
  /** Heure à laquelle l'étape a été atteinte (« 8 h 17 »), si le serveur l'a notée. */
  heure: string | null;
}

/**
 * Quatre étapes de la maquette (JS 1377-1380), avec les heures posées par le
 * serveur à chaque statut (order.service, updateStatus) :
 * Confirmée (accepted_at), En préparation (prepared_at, début de la
 * préparation), En route (picked_up_at) ou Prête au comptoir (ready_at),
 * Livrée ou Récupérée (completed_at, collected_at).
 *
 * Payée mais pas encore acceptée (PENDING) : la première étape est en cours,
 * « En attente de confirmation ».
 */
export function etapesFrise(
  c: Pick<ICommande, "type" | "status" | "heures">,
): IEtapeFrise[] {
  const retrait = c.type === "PICKUP";
  const h = c.heures;
  const modele: [string, string, NomIcone, string | null][] = [
    [
      "Confirmée",
      "Le restaurant a accepté votre commande.",
      "coche",
      h.accepted_at,
    ],
    [
      "En préparation",
      "Votre commande est en cuisine.",
      "cuisine",
      h.prepared_at,
    ],
    retrait
      ? [
          "Prête au comptoir",
          "Passez la récupérer avec votre code.",
          "sac",
          h.ready_at,
        ]
      : ["En route", "Le livreur arrive vers vous.", "scooter", h.picked_up_at],
    retrait
      ? [
          "Récupérée",
          "Bon appétit.",
          "etoile",
          h.collected_at ?? h.completed_at,
        ]
      : ["Livrée", "Bon appétit.", "etoile", h.completed_at ?? h.collected_at],
  ];
  const indexActuel = etapesSuivi(c.type).findIndex((e) =>
    e.statuts.includes(c.status),
  );
  const finie = indexActuel === modele.length - 1;

  return modele.map(([libelle, texte, icone, quand], i) => {
    const etat: EtatEtape =
      i < indexActuel || finie
        ? "fait"
        : i === indexActuel || (indexActuel < 0 && i === 0)
          ? "actuel"
          : "avenir";

    if (etat === "actuel" && indexActuel < 0) {
      return {
        libelle: "En attente de confirmation",
        texte: "Le restaurant va confirmer votre commande dans un instant.",
        icone,
        etat,
        heure: null,
      };
    }

    return {
      libelle,
      texte:
        etat !== "avenir"
          ? texte
          : i === 2 && !retrait
            ? `Livraison en 20${N}à${N}35${N}min au total`
            : "À venir",
      icone,
      etat,
      heure: etat === "avenir" ? null : heureDe(quand),
    };
  });
}

// ── Points gagnés ─────────────────────────────────────────────────────────

/**
 * Points crédités par cette commande : comme le serveur à la confirmation du
 * paiement en ligne (kkiapay-order.listener : floor(net_amount × points_per_xof),
 * plats avant remise, hors livraison et frais de service). Rien pour une
 * commande non payée, payée autrement qu'en ligne ou annulée.
 */
export function pointsCredites(
  c: Pick<ICommande, "paied" | "payment_method" | "status" | "net_amount">,
  pointsParFranc: number | null | undefined,
): number {
  if (
    !c.paied ||
    c.payment_method !== "ONLINE" ||
    c.status === "CANCELLED" ||
    !pointsParFranc
  )
    return 0;

  return pointsGagnes(c.net_amount, pointsParFranc);
}

/** « +12 points crédités » (rien sous 1 point). */
export const textePointsCredites = (n: number) =>
  n >= 1
    ? `+${nombre(n)}${N}point${n >= 2 ? "s" : ""} crédité${n >= 2 ? "s" : ""}`
    : null;

/**
 * « 1 point par tranche de 1 000 FCFA de plats payés en ligne », tiré du
 * taux du back office. null si le taux ne donne pas une tranche ronde.
 */
export function texteTranche(
  pointsParFranc: number | null | undefined,
): string | null {
  if (!pointsParFranc || !(pointsParFranc > 0)) return null;
  const tranche = 1 / pointsParFranc;

  if (Math.abs(tranche - Math.round(tranche)) > 1e-6 || Math.round(tranche) < 1)
    return null;

  return `1${N}point par tranche de ${fcfa(Math.round(tranche))} de plats payés en ligne`;
}

/**
 * Règles des points en une phrase (bloc « Mon compte »), tirées des réglages
 * du back office : « 1 point = 20 FCFA, utilisables dès 50 points, jusqu'à
 * la moitié des plats, pendant 365 jours. » Rien n'est écrit en dur.
 */
export function texteReglesPoints(
  r: IReglagesFidelite | null | undefined,
): string | null {
  if (!r) return null;
  const phrases: string[] = [];
  const tranche = texteTranche(r.pointsParFranc);

  if (tranche) phrases.push(`${tranche}.`);
  if (r.valeurPoint > 0) {
    const morceaux = [`1${N}point = ${valeurLisible(r.valeurPoint)}`];

    if (r.minimum >= 1)
      morceaux.push(`utilisables dès ${pointsLisibles(r.minimum)}`);
    if (r.plafondPct === 50) morceaux.push("jusqu'à la moitié des plats");
    else if (r.plafondPct > 0 && r.plafondPct < 100)
      morceaux.push(`jusqu'à ${nombre(r.plafondPct)}${N}% des plats`);
    if (r.joursValidite)
      morceaux.push(`pendant ${nombre(r.joursValidite)}${N}jours`);
    phrases.push(`${morceaux.join(", ")}.`);
  }

  return phrases.length ? phrases.join(" ") : null;
}

// ── Résumé et lieu ────────────────────────────────────────────────────────

/** « 2 × MENU À COMPOSER, 1 × BABATCHÊ, cadeaux offerts » (Mes commandes). */
export function resumeCommande(c: Pick<ICommande, "lignes">): string {
  const payantes = c.lignes
    .filter((l) => !l.offert)
    .map((l) => `${nombre(l.quantite)}${N}× ${l.nom}`);
  const offerts = c.lignes.some(
    (l) => l.offert || l.supplementsChoisis.some((s) => s.offert),
  );

  return [...payantes, ...(offerts ? ["cadeaux offerts"] : [])].join(", ");
}

/** Restaurant de la commande tel que le site le présente (nom accentué, adresse courte, page). */
export function restaurantDeCommande(c: Pick<ICommande, "restaurant">) {
  if (!c.restaurant) return null;
  const r = restaurantDuSite({
    id: c.restaurant.id,
    name: c.restaurant.name,
    address: c.restaurant.address,
    latitude: null,
    longitude: null,
    image: null,
    schedule: null,
    entity_status: "ACTIVE",
  });

  return { nom: r.nomAffiche, adresse: r.adresseCourte, slug: r.slug };
}

/**
 * Lieu de la commande : « Livraison » et l'adresse, ou « Retrait au
 * restaurant » et le nom du restaurant (récapitulatif, Mes commandes).
 */
export function lieuCommande(
  c: Pick<ICommande, "type" | "adresse" | "restaurant">,
) {
  const r = restaurantDeCommande(c);

  if (c.type === "PICKUP") {
    return {
      titre: "Retrait au restaurant",
      court: "Retrait",
      detail: r ? `Chicken Nation ${r.nom}` : "Restaurant",
    };
  }

  return {
    titre: "Livraison",
    court: "Livraison",
    detail: c.adresse ?? "Adresse de livraison",
  };
}

// ── Remettre une commande dans le panier ──────────────────────────────────

/**
 * Lignes de panier refaites depuis une commande et les plats relus au
 * catalogue (« Recommander », « Modifier ») : mêmes plats, choix et
 * suppléments payants, aux prix du jour. Les plats offerts ne reviennent
 * jamais ; un plat retiré, plus vendu en ligne ou non relu est nommé dans
 * `absents`.
 */
export function lignesPourPanier(
  c: Pick<ICommande, "lignes">,
  plats: Record<string, IPlatDetail | null>,
): { lignes: ILignePanier[]; absents: string[] } {
  const lignes: ILignePanier[] = [];
  const absents = new Set<string>();

  for (const l of c.lignes) {
    if (l.offert) continue;
    const ligne = lignePanierDepuisCommande(l, plats[l.dish_id]);

    if (ligne) lignes.push(ligne);
    else absents.add(l.nom);
  }

  return { lignes, absents: Array.from(absents) };
}

/**
 * Panier après « Modifier » : les lignes de la commande sont remises, sauf
 * celles déjà présentes à l'identique. Le panier peut encore les contenir
 * (il n'est vidé qu'au paiement) : les ajouter doublerait les quantités. Ce
 * que le client a ajouté depuis est gardé.
 */
export function remettreSansDoubler(
  panier: ILignePanier[],
  lignes: ILignePanier[],
): ILignePanier[] {
  return lignes.reduce(
    (p, l) => (p.some((x) => x.cle === l.cle) ? p : [...p, l]),
    panier,
  );
}

/** « Ajouté au panier : 2 × MENU À COMPOSER, 1 × BABATCHÊ. » */
export const texteAjout = (lignes: ILignePanier[]) =>
  `Ajouté au panier${N}: ${lignes.map((l) => `${nombre(l.quantite)}${N}× ${l.nom}`).join(", ")}.`;

/** « Plus proposé en ligne : X. » ou « Plus proposés en ligne : X, Y. » */
export const texteAbsents = (absents: string[]) =>
  absents.length
    ? `Plus proposé${absents.length > 1 ? "s" : ""} en ligne${N}: ${absents.join(", ")}.`
    : null;

// ── Mon compte ────────────────────────────────────────────────────────────

export type NiveauFidelite = "standard" | "vip" | "vvip";

/** Ce que le bloc « Mon compte » montre ; chaque partie peut manquer sans l'autre. */
export interface ICompteClient {
  /** Points utilisables, ou null si illisibles. */
  solde: number | null;
  niveau: NiveauFidelite | null;
  /** Noms des cadeaux à utiliser, ou null si illisibles. */
  cadeaux: string[] | null;
  reglages: IReglagesFidelite | null;
}

/** current_level de GET /fidelity/loyalty/customer/:id (STANDARD, VIP, VVIP). */
export function niveauFidelite(brut: unknown): NiveauFidelite | null {
  const n = String((brut as Brut | null)?.current_level ?? "").toUpperCase();

  return n === "VVIP"
    ? "vvip"
    : n === "VIP"
      ? "vip"
      : n === "STANDARD"
        ? "standard"
        : null;
}

/** Réponses brutes de l'API (null : appel en échec) remises pour « Mon compte ». */
export function versCompte(
  reglages: unknown | null,
  compte: unknown | null,
  cadeaux: unknown | null,
): ICompteClient {
  return {
    solde: compte ? soldeUtilisable(compte as Brut) : null,
    niveau: compte ? niveauFidelite(compte) : null,
    cadeaux: Array.isArray(cadeaux)
      ? (cadeaux as Brut[])
          .map(versCadeau)
          .filter((x) => x !== null)
          .map((x) => x.nom)
          .slice(0, 10)
      : null,
    reglages: reglages ? versReglagesFidelite(reglages) : null,
  };
}
