import { cache } from "react";

import { baseURL } from "@/config/api";
import { PaginatedResponse } from "@/types/api.type";

/** Étiquette de cache des avis (à passer à `revalidateTag` après une approbation au backoffice). */
export const ETIQUETTE_AVIS = "avis";
const REVALIDATION_AVIS = 3600;

export interface ICommentaireAPI {
  obtenirMeilleursCommentaires(
    params: ObtenirCommentairesParams,
  ): Promise<PaginatedResponse<ICommentaire>>;
}

type AvisBrut = {
  id?: unknown;
  message?: unknown;
  rating?: unknown;
  created_at?: unknown;
  customer?: { first_name?: unknown; last_name?: unknown } | null;
};

const texte = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * Liste blanche d'un avis : note, texte, prénom et initiale du nom. Même si
 * un serveur plus ancien renvoyait encore le nom entier, le téléphone ou la
 * commande, rien de plus n'entre dans les pages.
 */
function versAvisPublic(a: AvisBrut): ICommentaire {
  const prenom = texte(a.customer?.first_name);
  const initiale = texte(a.customer?.last_name).charAt(0).toUpperCase();

  return {
    id: String(a.id ?? ""),
    message: texte(a.message),
    rating: Number(a.rating) || 0,
    created_at: String(a.created_at ?? ""),
    customer: {
      ...(prenom ? { first_name: prenom } : {}),
      ...(initiale ? { last_name: initiale } : {}),
    },
  };
}

/**
 * Lecture par `fetch` natif et non par ak-api-http (lib/api.ts) : cette
 * bibliothèque passe par axios, que Next ne met pas en cache.
 * Seulement les avis approuvés au backoffice (« Visible sur le site »).
 */
async function lireAvis(
  params: ObtenirCommentairesParams,
): Promise<PaginatedResponse<ICommentaire>> {
  const recherche = new URLSearchParams();

  for (const [cle, valeur] of Object.entries(params)) {
    if (valeur !== undefined && valeur !== null)
      recherche.set(cle, String(valeur));
  }
  const res = await fetch(`${baseURL}/comments/bests?${recherche.toString()}`, {
    next: { revalidate: REVALIDATION_AVIS, tags: [ETIQUETTE_AVIS] },
  });

  if (!res.ok)
    throw new Error(
      `Avis illisibles : GET /comments/bests a répondu ${res.status}`,
    );
  const corps = (await res.json()) as {
    data?: AvisBrut[];
    meta?: PaginatedResponse<ICommentaire>["meta"];
  };

  if (!Array.isArray(corps?.data))
    throw new Error("Avis illisibles : réponse sans liste");
  const data = corps.data.map(versAvisPublic).filter((a) => a.id && a.message);

  return {
    data,
    meta: corps.meta ?? {
      total: data.length,
      page: params.page ?? 1,
      limit: params.limit ?? data.length,
      totalPages: 1,
    },
  };
}

export const commentaireAPI: ICommentaireAPI = {
  obtenirMeilleursCommentaires(params: ObtenirCommentairesParams) {
    return lireAvis(params);
  },
};

/**
 * Avis clients des pages publiques (accueil, application). Section
 * secondaire : en cas d'échec, liste vide (section masquée) plutôt qu'une
 * page bloquée. Vide aussi sur la base de test, qui n'a aucun avis approuvé.
 */
export const obtenirAvisPublics = cache(
  async (limite: number = 12): Promise<ICommentaire[]> => {
    try {
      return (await lireAvis({ page: 1, limit: limite })).data;
    } catch (erreur) {
      // eslint-disable-next-line no-console -- journal du serveur : section masquée
      console.warn("Avis clients masqués :", (erreur as Error).message);

      return [];
    }
  },
);
