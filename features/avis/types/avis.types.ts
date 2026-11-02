/**
 * Page « Ton avis compte » (/fr/avis) : retour PRIVÉ d'un client, envoyé au
 * serveur (POST /avis-prives) et traité par le call center au back-office.
 * Jamais publié sur le site. Codes identiques à ceux du serveur
 * (backend/src/modules/customer/avis-prives).
 */

export const RESSENTIS = ["AU_TOP", "PEUT_MIEUX_FAIRE", "PAS_CONTENT"] as const;
export type RessentiAvis = (typeof RESSENTIS)[number];

export const CANAUX = [
  "APPLI",
  "SITE_WEB",
  "TELEPHONE",
  "WHATSAPP",
  "SUR_PLACE",
  "AUTRE_PLATEFORME",
] as const;
export type CanalAvis = (typeof CANAUX)[number];

/** Restaurant proposé dans « Dans quel store ? » (lu dans l'API, jamais écrit à la main). */
export interface StoreAvis {
  id: string;
  nom: string;
}

/** Écrans du parcours, sur une seule adresse. */
export type EcranAvis = "presentation" | "experience" | "numero" | "merci";

/** Ce que le visiteur a saisi dans le navigateur. */
export interface SaisieAvis {
  ressenti: RessentiAvis | null;
  /** "" tant que rien n'est choisi. */
  canal: CanalAvis | "";
  /** "" = « Je ne sais pas ». */
  restaurantId: string;
  commentaire: string;
  telephone: string;
  prenom: string;
  accordRappel: boolean;
}

/** Ce que le navigateur passe à l'action serveur (revérifié par elle). */
export interface EnvoiAvis {
  ressenti: string | null;
  canal: string;
  restaurant_id: string | null;
  commentaire: string;
  telephone: string;
  prenom: string;
  accord_rappel: boolean;
  source: string;
  /** Champ piège : vide pour un humain. */
  site_web: string;
}

/** Corps exact de POST /avis-prives (contrat, 4.1 et 5.5). */
export interface DonneesAvis {
  ressenti: RessentiAvis;
  canal: CanalAvis;
  restaurant_id: string | null;
  commentaire: string;
  /** Mobile ivoirien canonique, +2250… */
  telephone: string;
  prenom: string | null;
  accord_rappel: boolean;
  source: string;
}

/** Réponse de l'action d'envoi. */
export type ResultatEnvoiAvis = { ok: true } | { ok: false; message: string };
