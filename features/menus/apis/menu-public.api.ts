import type { ICategorieCarte, IPlatApi } from "../types/carte.types";
import type { IPlatDetail } from "@/features/commande/types/commande.types";

import { cache } from "react";

import { construireCarte } from "../carte";

import { baseURL } from "@/config/api";
import { versPlatDetail } from "@/features/commande/utils/reponses-api.utils";

export type { ICategorieCarte, IPlatCarte } from "../types/carte.types";

/** Étiquette de cache de la carte (à passer à `revalidateTag` après un changement au backoffice). */
export const ETIQUETTE_CARTE = "carte";
const REVALIDATION_CARTE = 900;

// La réponse brute (776 ko pour 49 plats en production) est gardée telle
// quelle par le cache de données de Next, qui refuse tout au-delà de 2 Mo.
const TAILLE_A_SURVEILLER = 1_500_000;

/**
 * Lecture de `GET /dishes` par `fetch` natif et non par ak-api-http (lib/api.ts) :
 * cette bibliothèque passe par axios, que Next ne met pas en cache.
 * En cas d'échec, une erreur est levée : pendant une revalidation, Next garde
 * la dernière version valide de la page au lieu de publier une carte vide ;
 * pendant la construction, celle-ci échoue et l'ancien conteneur reste en service.
 */
async function lirePlatsApi(): Promise<IPlatApi[]> {
  const res = await fetch(`${baseURL}/dishes`, {
    next: { revalidate: REVALIDATION_CARTE, tags: [ETIQUETTE_CARTE] },
    // Le site sait composer un menu (options) : le serveur montre alors
    // aussi les plats composables, cachés aux anciennes applications.
    headers: { "x-app-composable": "1" },
  });

  if (!res.ok)
    throw new Error(
      `Carte publique illisible : GET /dishes a répondu ${res.status}`,
    );
  const texte = await res.text();

  if (texte.length > TAILLE_A_SURVEILLER) {
    // eslint-disable-next-line no-console -- journal du serveur : taille de la réponse à surveiller
    console.warn(
      `GET /dishes pèse ${Math.round(texte.length / 1000)} ko : au-delà de 2 Mo, Next ne la met plus en cache (plan, risque R5).`,
    );
  }
  const corps = JSON.parse(texte) as IPlatApi[] | { data?: IPlatApi[] };
  const plats = Array.isArray(corps) ? corps : corps.data;

  if (!Array.isArray(plats))
    throw new Error(
      "Carte publique illisible : GET /dishes ne renvoie pas de liste",
    );

  return plats;
}

/**
 * Carte publique rangée par catégorie (ordre de `carte.categories.ts`), avec
 * une section Promotions en tête quand des plats sont en promotion.
 * Gardée 15 minutes : un prix ou une promotion changés au backoffice arrivent
 * sur le site sans redéploiement. Une seule lecture par rendu (`cache`) :
 * accroche, promotions, catégories, pages plats et sitemap la partagent.
 */
export const obtenirCartePublique = cache(
  async (): Promise<ICategorieCarte[]> => construireCarte(await lirePlatsApi()),
);

/**
 * Détail public d'un plat (épicé, choix d'un menu composable, suppléments),
 * pour écrire sa composition dans le HTML de sa page : sans lui, ces
 * informations n'existaient que dans la fiche chargée au clic, invisibles des
 * moteurs de recherche (recette référencement, contenu des pages plats).
 * Même cadence que la carte. API muette : null, la page se passe du bloc.
 */
export const obtenirDetailPlatPublic = cache(
  async (id: string): Promise<IPlatDetail | null> => {
    try {
      const res = await fetch(`${baseURL}/dishes/${encodeURIComponent(id)}`, {
        next: { revalidate: REVALIDATION_CARTE, tags: [ETIQUETTE_CARTE] },
        headers: { "x-app-composable": "1" },
      });

      if (!res.ok) return null;

      return versPlatDetail((await res.json()) as Record<string, unknown>);
    } catch {
      return null;
    }
  },
);
