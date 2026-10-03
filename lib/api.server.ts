import { Api } from "ak-api-http";
import type { Session } from "next-auth";
import { auth, signOut } from "@/lib/auth";
import { reglagesApi } from "@/lib/api";

/**
 * Accès à l'API pour le compte du membre du personnel connecté, CÔTÉ SERVEUR
 * uniquement (importé par les actions serveur, jamais par un composant client).
 */

/** Réponse d'une action refusée faute de session (même forme que ActionResponse). */
export type RefusSession = { success: false; error: string };

export type SessionPersonnel =
  | { ok: true; utilisateur: Session["user"]; client: Api }
  | { ok: false; refus: RefusSession };

/**
 * À appeler au DÉBUT de chaque action serveur qui agit pour le compte du
 * personnel. Une action serveur s'appelle par un simple POST, par n'importe
 * qui connaissant son identifiant (il figure dans le JavaScript de la page) :
 * la protection des pages par proxy.ts ne la couvre pas.
 *
 * Lit la session de CETTE requête et renvoie un client de l'API créé pour elle
 * seule, avec son jeton : rien n'est gardé d'une requête à l'autre, et deux
 * personnes servies en même temps par le même processus ne partagent rien.
 */
export async function exigerSessionPersonnel(): Promise<SessionPersonnel> {
  const session = await auth();
  const utilisateur = session?.user;
  const jeton = utilisateur?.accessToken;
  if (!utilisateur || typeof jeton !== "string" || !jeton) {
    return { ok: false, refus: { success: false, error: "Connectez-vous pour continuer." } };
  }
  return { ok: true, utilisateur, client: clientPourJeton(jeton) };
}

function clientPourJeton(jeton: string): Api {
  return new Api({
    ...reglagesApi,
    enableAuth: true,
    // Jeton fixé à la création : l'instance ne sert qu'à la requête en cours.
    getSession: async () => ({ accessToken: jeton }),
    // Jeton refusé par l'API (expiré, compte désactivé) : on ferme la session
    // de CETTE personne, sans redirection (une action la perdait de toute
    // façon). Pendant le rendu d'une page, Next interdit d'écrire un cookie :
    // la session sera fermée à la prochaine action.
    signOut: async () => {
      try {
        await signOut({ redirect: false });
      } catch {
        // Rien à faire : voir ci-dessus.
      }
    },
  });
}
