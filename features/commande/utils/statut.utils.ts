import type { ICommande } from "../types/commande.types";

/** Libellés repris de l'application (app/src/features/orders/utils/order.utils.tsx). */
export function libelleStatut(c: Pick<ICommande, "status" | "type" | "paied" | "payment_method">) {
  if (c.status === "PENDING" && c.payment_method === "ONLINE" && !c.paied) return "En attente de paiement";
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

export function couleurStatut(c: Pick<ICommande, "status" | "paied" | "payment_method">) {
  if (c.status === "CANCELLED") return "bg-red-100 text-red-700";
  if (c.status === "COMPLETED" || c.status === "COLLECTED") return "bg-green-100 text-green-700";
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

/** Commande en ligne pas encore payée, qu'on peut encore régler. */
export const aPayer = (c: Pick<ICommande, "status" | "paied" | "payment_method">) =>
  c.payment_method === "ONLINE" && !c.paied && c.status === "PENDING";
