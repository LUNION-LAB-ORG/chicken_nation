import type { ILignePanier } from "../types/commande.types";

/**
 * Ce que le navigateur retient entre deux chargements de page, hors panier :
 * le panier d'une commande créée (pour la modifier) et la tentative de
 * paiement d'une commande (pour ne pas faire payer deux fois).
 *
 * Navigation privée ou stockage bloqué : chaque accès peut lever une
 * exception, d'où les try/catch. On perd alors ce confort, rien de plus.
 */

const lire = (zone: () => Storage, cle: string): string | null => {
  try {
    return zone().getItem(cle);
  } catch {
    return null;
  }
};

const ecrire = (zone: () => Storage, cle: string, valeur: string | null) => {
  try {
    if (valeur === null) zone().removeItem(cle);
    else zone().setItem(cle, valeur);
  } catch {
    /* stockage indisponible */
  }
};

const session = () => window.sessionStorage;
const local = () => window.localStorage;

// ── Panier d'une commande créée ───────────────────────────────────────────

/**
 * Le panier est vidé dès la création de la commande, avant le paiement. On
 * garde ses lignes le temps de l'onglet : « Modifier ma commande » les remet
 * dans le panier après avoir annulé la commande non payée.
 */
const clePanier = (commandeId: string) => `cn-panier-commande-${commandeId}`;

export function sauverPanierCommande(
  commandeId: string,
  lignes: ILignePanier[],
) {
  ecrire(session, clePanier(commandeId), JSON.stringify(lignes));
}

export function lirePanierCommande(commandeId: string): ILignePanier[] {
  try {
    const lignes = JSON.parse(lire(session, clePanier(commandeId)) ?? "[]");

    return Array.isArray(lignes)
      ? lignes.filter(
          (l) =>
            l && typeof l.cle === "string" && typeof l.dish_id === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function oublierPanierCommande(commandeId: string) {
  ecrire(session, clePanier(commandeId), null);
}

// ── Commande créée à l'étape Paiement, pas encore payée ────────────────────

/**
 * La caisse crée la commande au clic « Payer » (étape 5), puis ouvre le module
 * de paiement. Si le client le ferme sans payer et clique de nouveau, c'est la
 * MÊME commande qui doit être payée, pas une seconde. On garde donc la
 * commande créée et la signature de ce qu'elle contient (caisse.utils,
 * signatureCommande).
 *
 * Gardée dans localStorage, et non plus le temps de l'onglet : un second
 * onglet, ou un onglet rouvert, retrouve la commande non payée au lieu d'en
 * créer une seconde identique (qui partait dans « À relancer »). Elle porte
 * le client qui l'a créée (jamais proposée à un autre compte du même
 * appareil) et vaut 2 h au plus. Une ancienne valeur de sessionStorage
 * (avant ce changement) est encore lue, puis rangée au même endroit.
 */
export interface ICommandeEnAttente {
  id: string;
  reference: string;
  signature: string;
  /** Client qui a créé la commande (absent dans une ancienne valeur). */
  client?: string;
  /** Moment où elle a été notée (absent dans une ancienne valeur). */
  notee?: number;
}

const CLE_EN_ATTENTE = "cn-commande-en-attente";

/** Au-delà, la commande non payée n'est plus reprise : panier, frais et créneau ont pu changer. */
export const DUREE_EN_ATTENTE_MS = 2 * 60 * 60 * 1000;

export function noterCommandeEnAttente(
  c: ICommandeEnAttente,
  maintenant = Date.now(),
) {
  ecrire(local, CLE_EN_ATTENTE, JSON.stringify({ ...c, notee: maintenant }));
  ecrire(session, CLE_EN_ATTENTE, null);
}

const valide = (c: unknown): c is ICommandeEnAttente => {
  const x = c as ICommandeEnAttente | null;

  return (
    !!x &&
    typeof x.id === "string" &&
    typeof x.reference === "string" &&
    typeof x.signature === "string" &&
    (x.client === undefined || typeof x.client === "string") &&
    (x.notee === undefined || typeof x.notee === "number")
  );
};

/**
 * Commande non payée de ce navigateur, ou null.
 * `clientId` : client connecté ; une commande d'un autre compte est ignorée
 * (sans être effacée : elle reste à son client).
 */
export function lireCommandeEnAttente(
  clientId?: string | null,
  maintenant = Date.now(),
): ICommandeEnAttente | null {
  const lue = (zone: () => Storage) => {
    try {
      const c = JSON.parse(lire(zone, CLE_EN_ATTENTE) ?? "null");

      return valide(c) ? c : null;
    } catch {
      return null;
    }
  };
  const c = lue(local) ?? lue(session);

  if (!c) return null;
  if (
    typeof c.notee === "number" &&
    maintenant - c.notee > DUREE_EN_ATTENTE_MS
  ) {
    oublierCommandeEnAttente();

    return null;
  }
  if (clientId && c.client && c.client !== clientId) return null;

  return c;
}

export function oublierCommandeEnAttente() {
  ecrire(local, CLE_EN_ATTENTE, null);
  ecrire(session, CLE_EN_ATTENTE, null);
}

// ── Remise des points plus faible que prévu ───────────────────────────────

/**
 * Le serveur peut accorder moins que la remise estimée au panier (solde ou
 * réglages changés entre-temps), ou rien du tout. Noté le temps de l'onglet
 * pour le dire sur la page de paiement, AVANT que le client ne paie.
 */
export interface IEcartPoints {
  estimee: number;
  accordee: number;
}

const cleEcart = (commandeId: string) => `cn-ecart-points-${commandeId}`;

export function noterEcartPoints(commandeId: string, ecart: IEcartPoints) {
  ecrire(session, cleEcart(commandeId), JSON.stringify(ecart));
}

export function lireEcartPoints(commandeId: string): IEcartPoints | null {
  try {
    const e = JSON.parse(
      lire(session, cleEcart(commandeId)) ?? "null",
    ) as IEcartPoints | null;

    return e &&
      typeof e.estimee === "number" &&
      typeof e.accordee === "number" &&
      e.accordee < e.estimee
      ? e
      : null;
  } catch {
    return null;
  }
}

export function oublierEcartPoints(commandeId: string) {
  ecrire(session, cleEcart(commandeId), null);
}

// ── Tentative de paiement ─────────────────────────────────────────────────

/**
 * Gardée par référence de commande dans localStorage : elle survit au
 * rechargement de la page, à l'onglet qu'Android recharge au retour de
 * l'application Mobile Money, et au retour arrière.
 */
export interface IMarquePaiement {
  /** Module de paiement ouvert (le client a pu payer sans qu'on le sache). */
  ouvertA?: number;
  /** KKiaPay a annoncé un paiement réussi. */
  succesA?: number;
}

/** Sous ce délai après le succès annoncé, la confirmation est relue vite. */
export const DELAI_CONFIRMATION_MS = 3 * 60 * 1000;
/** Sous ce délai, ni réouverture automatique ni bouton « Payer » après un succès. */
export const DELAI_PROTECTION_MS = 15 * 60 * 1000;
const DUREE_MARQUE_MS = 24 * 60 * 60 * 1000;

/**
 * - `libre` : aucune tentative récente, paiement normal ;
 * - `commence` : module ouvert il y a moins de 15 min sans issue connue, ou
 *   succès annoncé il y a plus de 15 min : « Payer » reste possible, avec
 *   un avertissement, mais le module ne s'ouvre plus tout seul ;
 * - `confirmation` : succès annoncé il y a moins de 3 min, relecture rapide ;
 * - `verification` : succès annoncé il y a 3 à 15 min, pas de « Payer ».
 */
export type EtatPaiement =
  | "libre"
  | "commence"
  | "confirmation"
  | "verification";

export function etatPaiement(
  marque: IMarquePaiement | null,
  maintenant: number,
): EtatPaiement {
  if (!marque) return "libre";
  if (typeof marque.succesA === "number") {
    const ecoule = maintenant - marque.succesA;

    if (ecoule < DELAI_CONFIRMATION_MS) return "confirmation";
    if (ecoule < DELAI_PROTECTION_MS) return "verification";

    return "commence";
  }
  if (
    typeof marque.ouvertA === "number" &&
    maintenant - marque.ouvertA < DELAI_PROTECTION_MS
  )
    return "commence";

  return "libre";
}

const cleMarque = (reference: string) => `cn-paiement-${reference}`;

export function lireMarquePaiement(
  reference: string,
  maintenant = Date.now(),
): IMarquePaiement | null {
  try {
    const m = JSON.parse(
      lire(local, cleMarque(reference)) ?? "null",
    ) as IMarquePaiement | null;

    if (!m || typeof m !== "object") return null;
    const derniere = Math.max(m.ouvertA ?? 0, m.succesA ?? 0);

    // Vieille marque : on fait le ménage.
    if (maintenant - derniere > DUREE_MARQUE_MS) {
      effacerMarquePaiement(reference);

      return null;
    }

    return m;
  } catch {
    return null;
  }
}

export function ecrireMarquePaiement(
  reference: string,
  marque: IMarquePaiement,
) {
  ecrire(local, cleMarque(reference), JSON.stringify(marque));
}

export function effacerMarquePaiement(reference: string) {
  ecrire(local, cleMarque(reference), null);
}
