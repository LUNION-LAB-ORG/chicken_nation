"use server";

import type { Resultat } from "../types/commande.types";
import type { IFichePlat } from "../utils/fiche.utils";

import { appelApi } from "../apis/api-client.server";
import { versPlatDetail } from "../utils/reponses-api.utils";

import { categorieDuSite } from "@/features/menus/carte.categories";

/**
 * Plat de la fiche (GET /dishes/:id, route publique, plats composables
 * compris) et forme courte de sa catégorie (« Box », « Burger »), tirée de la
 * même réponse : une seule requête à l'ouverture de la fiche.
 */
export async function lireFichePlatAction(
  id: string,
): Promise<Resultat<IFichePlat>> {
  if (!/^[0-9a-f-]{36}$/i.test(String(id)))
    return { ok: false, message: "Ce plat est introuvable.", statut: 404 };
  const res = await appelApi<Record<string, unknown>>(`/dishes/${id}`, {
    public: true,
    entetes: { "x-app-composable": "1" },
  });

  if (!res.ok) return res;
  if (!res.data || typeof res.data !== "object")
    return { ok: false, message: "Ce plat est introuvable.", statut: 404 };
  const nom = (res.data.category as { name?: unknown } | null | undefined)
    ?.name;

  return {
    ok: true,
    data: {
      plat: versPlatDetail(res.data),
      categorie:
        typeof nom === "string" && nom.trim()
          ? categorieDuSite(nom).court
          : null,
    },
  };
}
