import type { ICommande } from "../types/commande.types";

/** Champs qui disent si une commande du site attend l'appel du centre d'appels. */
type EtatConfirmation = Pick<ICommande, "status" | "paied" | "payment_method"> &
  Partial<Pick<ICommande, "canal" | "auto">>;

/**
 * Libellés repris de l'application (app/src/features/orders/utils/order.utils.tsx),
 * plus « À confirmer » pour une commande du site à payer à la livraison.
 */
export function libelleStatut(c: EtatConfirmation & Pick<ICommande, "type">) {
  if (c.status === "PENDING" && c.payment_method === "ONLINE" && !c.paied)
    return "En attente de paiement";
  if (aConfirmer(c)) return "À confirmer";
  switch (c.status) {
    case "PENDING":
      return "En attente";
    case "ACCEPTED":
      return "Confirmée";
    case "IN_PROGRESS":
      return "En préparation";
    case "READY":
      return c.type === "PICKUP" ? "Au comptoir" : "Prête";
    case "PICKED_UP":
      return "En route";
    case "COLLECTED":
      return "Récupérée";
    case "COMPLETED":
      return "Terminée";
    case "CANCELLED":
      return "Annulée";
    default:
      return c.status;
  }
}

export function couleurStatut(
  c: Pick<ICommande, "status" | "paied" | "payment_method">,
) {
  if (c.status === "CANCELLED") return "bg-red-100 text-red-700";
  if (c.status === "COMPLETED" || c.status === "COLLECTED")
    return "bg-green-100 text-green-700";
  if (c.status === "PENDING") return "bg-amber-100 text-amber-700";

  return "bg-blue-100 text-blue-700";
}

/** Étapes affichées dans le suivi, selon le mode. */
export function etapesSuivi(type: string) {
  return type === "PICKUP"
    ? [
        { statuts: ["ACCEPTED"], libelle: "Confirmée" },
        { statuts: ["IN_PROGRESS"], libelle: "En préparation" },
        { statuts: ["READY"], libelle: "Prête au comptoir" },
        { statuts: ["COLLECTED", "COMPLETED"], libelle: "Récupérée" },
      ]
    : [
        { statuts: ["ACCEPTED"], libelle: "Confirmée" },
        { statuts: ["IN_PROGRESS", "READY"], libelle: "En préparation" },
        { statuts: ["PICKED_UP"], libelle: "En route" },
        { statuts: ["COMPLETED", "COLLECTED"], libelle: "Livrée" },
      ];
}

/** Livrée, récupérée ou annulée : plus rien ne bougera, le suivi s'arrête. */
export const estTerminee = (c: Pick<ICommande, "status">) =>
  c.status === "COMPLETED" ||
  c.status === "COLLECTED" ||
  c.status === "CANCELLED";

/** Commande en ligne pas encore payée, qu'on peut encore régler. */
export const aPayer = (
  c: Pick<ICommande, "status" | "paied" | "payment_method">,
) => c.payment_method === "ONLINE" && !c.paied && c.status === "PENDING";

/**
 * Commande du site à payer à la livraison que le centre d'appels n'a pas
 * encore confirmée (règle `estAConfirmer` du serveur) : elle n'est pas encore
 * partie au restaurant, le client peut la modifier. Jamais une commande en
 * espèces de l'application (canal APP ou vide), ni une commande saisie ou
 * reprise au centre d'appels (`auto` faux).
 */
export const aConfirmer = (c: EtatConfirmation) =>
  c.payment_method === "OFFLINE" &&
  !c.paied &&
  c.status === "PENDING" &&
  c.canal === "WEB" &&
  c.auto === true;

/** Statuts où une commande livrée n'a pas encore été remise au client. */
const AVANT_REMISE: ICommande["status"][] = [
  "PENDING",
  "ACCEPTED",
  "IN_PROGRESS",
  "READY",
  "PICKED_UP",
];

/**
 * Livraison à payer au livreur, pas encore remise. Une commande remise
 * (COLLECTED) attend seulement la confirmation de l'encaissement du livreur :
 * on n'y écrit plus « à payer ». Un retrait n'est jamais « à la livraison ».
 */
export const aPayerALaLivraison = (
  c: Pick<ICommande, "status" | "paied" | "payment_method" | "type">,
) =>
  c.payment_method === "OFFLINE" &&
  !c.paied &&
  c.type !== "PICKUP" &&
  AVANT_REMISE.includes(c.status);
