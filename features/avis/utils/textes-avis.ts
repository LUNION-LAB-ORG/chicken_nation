import type { CanalAvis, RessentiAvis } from "../types/avis.types";

import { INSECABLE, nombre } from "@/lib/typo";

/**
 * Textes de la page « Ton avis compte », repris mot pour mot de la maquette
 * (contrat, 5.4). Tutoiement comme dans la maquette, insécable avant « : ? ! »,
 * jamais de tiret cadratin ni demi-cadratin (scripts/interdits.txt).
 */

export const CHEMIN_AVIS = "/avis";

export const TITRE_PAGE_AVIS = "Ton avis compte";

export const DESCRIPTION_PAGE_AVIS = `Un retard, une commande incomplète, un plat pas à la hauteur${INSECABLE}: dis-le-nous. Ton message reste privé, notre équipe le lit.`;

export const ALT_MASCOTTE = "Le Champion, mascotte Chicken Nation";

/** Bornes du formulaire, identiques à celles du serveur (CreerAvisPriveDto). */
export const COMMENTAIRE_MIN = 2;
export const COMMENTAIRE_MAX = 1000;
export const PRENOM_MAX = 60;
/** Longueur de saisie du numéro (espaces et +225 compris). */
export const TELEPHONE_MAX = 20;

export const TEXTES_AVIS = {
  presentation: {
    titre: "MÊME LE CHAMPION SE TROMPE PARFOIS",
    sousTitre: "Ton avis compte.",
    paragraphes: [
      `Chez Chicken Nation, chaque commande et chaque passage dans nos stores nous fait grandir. Mais on n'est pas parfaits${INSECABLE}: un retard, une commande incomplète, un plat pas à la hauteur, ça peut arriver.`,
      "Quand c'est le cas, on veut le savoir, pour de vrai. Et si tout s'est bien passé, dis-le-nous aussi.",
    ],
    prive:
      "Ton message reste privé. Il n'est jamais publié sur le site. Notre équipe le lit et te rappelle si quelque chose ne va pas.",
    bouton: "Donner mon avis",
    duree: `Ça prend moins de 2${INSECABLE}minutes.`,
  },
  retour: "Retour",
  experience: {
    etape: "Étape 1 sur 2",
    titre: "TON EXPÉRIENCE",
    legende: `Comment s'est passée ta dernière expérience${INSECABLE}?`,
    canal: `Tu avais commandé comment${INSECABLE}?`,
    choisir: "Choisir",
    store: `Dans quel store${INSECABLE}?`,
    jeNeSaisPas: "Je ne sais pas",
    commentaire: "Raconte-nous",
    indication:
      "Raconte-nous ce qui s'est passé. Plus tu es précis, plus on pourra t'aider.",
    bouton: "Continuer",
  },
  numero: {
    etape: "Étape 2 sur 2",
    titre: "POUR QU'ON PUISSE TE RETROUVER",
    intro:
      "Indique le numéro avec lequel tu as déjà passé commande. On s'en sert uniquement pour retrouver ta commande et te rappeler.",
    telephone: "Ton numéro de téléphone",
    aideTelephone: "Le numéro que tu utilises sur l'appli ou au téléphone.",
    prenom: "Ton prénom",
    facultatif: "(facultatif)",
    indicationPrenom: `Ex.${INSECABLE}: Awa`,
    accord: "J'accepte d'être rappelé par l'équipe Chicken Nation",
    bouton: "Envoyer mon avis",
    envoi: "Envoi en cours…",
    mentionDebut: `Ton avis reste privé et n'est utilisé que pour traiter ton retour. Pour le faire supprimer${INSECABLE}: `,
  },
  merci: {
    attente: `En attendant, ton Chicken est toujours là${INSECABLE}:`,
    appli: "Appli Chicken Nation",
    site: "chicken-nation.com",
    accueil: "Retour à l'accueil",
  },
} as const;

/** Libellés des ressentis, dans l'ordre de la maquette. */
export const LIBELLES_RESSENTIS: Record<RessentiAvis, string> = {
  AU_TOP: "Au top",
  PEUT_MIEUX_FAIRE: "Peut mieux faire",
  PAS_CONTENT: "Pas content",
};

/**
 * Libellés des canaux pour le CLIENT (c'est lui qui répond : « Téléphone »).
 * Au back-office, le même code s'affiche « Manuel ».
 */
export const LIBELLES_CANAUX: Record<CanalAvis, string> = {
  APPLI: "Appli Chicken Nation",
  SITE_WEB: "Site web",
  TELEPHONE: "Téléphone",
  WHATSAPP: "WhatsApp",
  SUR_PLACE: "Sur place en store",
  AUTRE_PLATEFORME: "Autre plateforme",
};

/** Messages d'erreur (ceux du serveur quand il en a un). */
export const ERREURS_AVIS = {
  ressenti: "Choisis ton ressenti.",
  canal: "Choisis comment tu avais commandé.",
  commentaire: "Raconte-nous ce qui s'est passé.",
  commentaireTropLong: `Ton message dépasse 1${INSECABLE}000 caractères.`,
  telephone: "Saisis un numéro mobile à 10 chiffres (07, 05 ou 01).",
  prenomTropLong: "Ton prénom ne doit pas dépasser 60 caractères.",
  store: "Ce store n'existe plus. Choisis-en un autre.",
  tropDEnvois:
    "Trop d'envois depuis cette connexion. Réessaie dans 15 minutes.",
  panne: "Ton avis n'a pas pu partir. Réessaie dans un instant.",
  pagePerimee: "La page a été mise à jour. Recharge-la, puis réessaie.",
} as const;

/** « 0 / 1 000 » : caractères saisis sur le maximum. */
export const compteurCaracteres = (longueur: number) =>
  `${nombre(longueur)}${INSECABLE}/${INSECABLE}${nombre(COMMENTAIRE_MAX)}`;

/**
 * Titre et message de l'écran Merci, d'après ce que le client a répondu.
 * La promesse « on te rappelle sous 24 h » n'est faite qu'au client pas
 * content qui a donné son accord de rappel : c'est le seul cas où le serveur
 * pose une échéance qu'il fait suivre au call center.
 */
export function ecranMerci(
  ressenti: RessentiAvis,
  accordRappel: boolean,
): { titre: string; message: string } {
  switch (ressenti) {
    case "PAS_CONTENT":
      return {
        titre: "ON EST DÉSOLÉS",
        message: accordRappel
          ? `Ton message est bien arrivé. Un membre de l'équipe te rappelle sous 24${INSECABLE}h pour trouver une solution.`
          : "Ton message est bien arrivé. L'équipe le lit et s'en occupe.",
      };
    case "PEUT_MIEUX_FAIRE":
      return {
        titre: "MERCI POUR TA FRANCHISE",
        message: "On regarde ce qui s'est passé et on s'améliore.",
      };
    case "AU_TOP":
      return {
        titre: `MERCI${INSECABLE}!`,
        message:
          "Ton message va droit au cœur de l'équipe. Tu fais partie de la Nation.",
      };
  }
}

/**
 * Sources permises (QR codes imprimés), jumelles de la liste blanche du
 * serveur (avis-prive.rules.ts, SOURCES). Toute autre valeur, ou son absence,
 * devient « site ».
 */
export const SOURCES_AVIS = ["marque-page", "ticket", "sac", "site"] as const;
export const SOURCE_PAR_DEFAUT = "site";

/** Code de source reconnu, sinon « site » (même règle que le serveur). */
export function sourceAutorisee(brute: unknown): string {
  if (typeof brute !== "string") return SOURCE_PAR_DEFAUT;
  const code = brute.trim().toLowerCase();

  if (!/^[a-z0-9-]{1,40}$/.test(code)) return SOURCE_PAR_DEFAUT;

  return (SOURCES_AVIS as readonly string[]).includes(code)
    ? code
    : SOURCE_PAR_DEFAUT;
}

/** Source lue dans l'adresse de la page (« ?source=marque-page » du QR code). */
export function sourceDepuisAdresse(recherche: string): string {
  try {
    return sourceAutorisee(new URLSearchParams(recherche).get("source"));
  } catch {
    return SOURCE_PAR_DEFAUT;
  }
}
