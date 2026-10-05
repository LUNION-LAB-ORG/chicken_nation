import { cookies, headers } from "next/headers";
import { baseURL } from "@/config/api";
import type { Resultat } from "../types/commande.types";
import { adresseIpVisiteur } from "../utils/adresse-ip.utils";

/**
 * Accès à l'API pour le compte du client connecté, CÔTÉ SERVEUR uniquement
 * (importé par les actions serveur, jamais par un composant client).
 *
 * Le jeton client renvoyé par /auth/customer/verify-otp vit dans un cookie
 * httpOnly : le JavaScript de la page ne peut pas le lire, une faille XSS ne
 * permet donc pas de le voler (l'application, elle, le garde sur le téléphone).
 */

export const COOKIE_CLIENT = "cn_client";
const DUREE_COOKIE_S = 30 * 24 * 60 * 60;

export async function lireJetonClient(): Promise<string | null> {
  return (await cookies()).get(COOKIE_CLIENT)?.value ?? null;
}

export async function poserJetonClient(jeton: string) {
  (await cookies()).set(COOKIE_CLIENT, jeton, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_COOKIE_S,
  });
}

export async function effacerJetonClient() {
  try {
    (await cookies()).delete(COOKIE_CLIENT);
  } catch {
    // Pendant le rendu d'une page, Next interdit d'écrire un cookie : la
    // session sera effacée à la prochaine action.
  }
}

/** Message lisible depuis une erreur NestJS (`message` texte ou tableau). */
function messageErreur(corps: unknown, statut: number): string {
  const brut = (corps as { message?: unknown } | null)?.message;
  const message = Array.isArray(brut) ? brut[0] : brut;
  if (typeof message === "string" && message.trim()) return message;
  if (statut === 401) return "Votre session a expiré. Reconnectez-vous.";
  if (statut === 429) return "Trop de demandes. Réessayez dans quelques minutes.";
  return "Le service est momentanément indisponible. Réessayez dans un instant.";
}

/**
 * Adresse du visiteur, transmise à l'API. Sans elle, toutes les requêtes du
 * site partiraient de l'adresse du serveur du site, et la limite par adresse
 * de l'API (20 demandes de code par minute) s'appliquerait à TOUS les
 * visiteurs ensemble. Vide si nginx ne la transmet pas au site. Règles de
 * lecture (quel en-tête croire) : utils/adresse-ip.utils.ts.
 */
async function adresseVisiteur(): Promise<string | null> {
  try {
    const h = await headers();
    return adresseIpVisiteur((nom) => h.get(nom));
  } catch {
    return null;
  }
}

interface OptionsAppel {
  methode?: "GET" | "POST" | "PATCH" | "DELETE";
  corps?: unknown;
  /** Appel sans jeton (routes publiques). */
  public?: boolean;
  entetes?: Record<string, string>;
}

export async function appelApi<T>(chemin: string, options: OptionsAppel = {}): Promise<Resultat<T>> {
  const jeton = options.public ? null : await lireJetonClient();
  if (!options.public && !jeton) return { ok: false, message: "Connectez-vous pour continuer." };

  const estFormulaire = options.corps instanceof FormData;
  const ip = await adresseVisiteur();
  try {
    const res = await fetch(`${baseURL}${chemin}`, {
      method: options.methode ?? "GET",
      cache: "no-store",
      headers: {
        ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
        ...(ip ? { "X-Forwarded-For": ip } : {}),
        ...(options.corps && !estFormulaire ? { "Content-Type": "application/json" } : {}),
        ...options.entetes,
      },
      body: options.corps
        ? estFormulaire
          ? (options.corps as FormData)
          : JSON.stringify(options.corps)
        : undefined,
    });
    const texte = await res.text();
    const corps = texte ? JSON.parse(texte) : null;
    if (!res.ok) {
      // Jeton refusé (expiré, compte supprimé) : on oublie la session.
      if (res.status === 401 && jeton) await effacerJetonClient();
      return { ok: false, message: messageErreur(corps, res.status), statut: res.status };
    }
    return { ok: true, data: corps as T };
  } catch {
    return { ok: false, message: messageErreur(null, 503) };
  }
}
