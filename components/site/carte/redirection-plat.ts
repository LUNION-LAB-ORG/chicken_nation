import type {
  ICategorieCarte,
  IPlatApi,
} from "@/features/menus/types/carte.types";

import { destinationPlat } from "./adresse-plat";

import { baseURL } from "@/config/api";
import { construireCarte } from "@/features/menus/carte";

/**
 * Redirection des anciennes adresses de plats, faite par proxy.ts AVANT la
 * page (recette des liens, défaut 1).
 *
 * La page d'un plat est mise en cache (revalidate). Quand un plat déjà rendu
 * change de nom ou disparaît, Next 16 garde la redirection dans son cache
 * SANS l'en-tête Location : toutes les visites suivantes recevaient un 308
 * sans destination (aperçus WhatsApp et Facebook, robots : page sans issue).
 * Ici la redirection ne passe par aucun cache de page, et une adresse
 * inventée n'écrit plus rien sur le disque (recette vitesse D10).
 *
 * La carte est relue au plus toutes les 5 minutes, gardée en mémoire du
 * serveur (une seule lecture à la fois, l'ancienne servie pendant la
 * relecture). API muette ou lente : rien n'est décidé ici, la page répond
 * seule (elle ne redirige plus, voir carte/[plat]/page.tsx).
 */

const MOTIF = /^\/fr\/carte\/([^/]+)$/;
const DUREE_MS = 5 * 60 * 1000;
const DELAI_API_MS = 4000;

let memoire: { carte: ICategorieCarte[]; lueA: number } | null = null;
let lecture: Promise<ICategorieCarte[] | null> | null = null;

async function lireCarte(): Promise<ICategorieCarte[] | null> {
  try {
    const res = await fetch(`${baseURL}/dishes`, {
      cache: "no-store",
      headers: { "x-app-composable": "1" },
      signal: AbortSignal.timeout(DELAI_API_MS),
    });

    if (!res.ok) return null;
    const corps = (await res.json()) as IPlatApi[] | { data?: IPlatApi[] };
    const plats = Array.isArray(corps) ? corps : corps.data;

    if (!Array.isArray(plats)) return null;
    const carte = construireCarte(plats);

    memoire = { carte, lueA: Date.now() };

    return carte;
  } catch {
    return null;
  }
}

/** Carte gardée en mémoire ; relue en arrière-plan quand elle a plus de 5 minutes. */
async function carteDuProxy(maintenant = Date.now()) {
  if (memoire && maintenant - memoire.lueA < DUREE_MS) return memoire.carte;
  lecture ??= lireCarte().finally(() => {
    lecture = null;
  });
  // Une carte ancienne vaut mieux que d'attendre l'API.
  if (memoire) return memoire.carte;

  return lecture;
}

/**
 * Destination d'une adresse `/fr/carte/<slug>` qui n'est pas celle d'un plat,
 * ou null (adresse exacte, autre page, carte illisible). Fonction pure.
 */
export function redirectionAdressePlat(
  chemin: string,
  carte: readonly ICategorieCarte[] | null,
): string | null {
  const m = chemin.match(MOTIF);

  if (!m || !carte || carte.length === 0) return null;
  const destination = destinationPlat(m[1], carte);

  return destination.type === "redirection" ? destination.chemin : null;
}

/** Pour proxy.ts : redirection à faire pour ce chemin, ou null. */
export async function redirectionPlat(chemin: string): Promise<string | null> {
  if (!MOTIF.test(chemin)) return null;

  return redirectionAdressePlat(chemin, await carteDuProxy());
}
