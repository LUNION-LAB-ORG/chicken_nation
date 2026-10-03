// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { AsyncLocalStorage } from "node:async_hooks";
import { afterEach, beforeAll, describe, expect, it, mock } from "bun:test";
import axios from "axios";

/**
 * Jeton du personnel et actions serveur, avec la VRAIE bibliothèque ak-api-http
 * (et le vrai axios) : seuls la session next-auth et le réseau sont simulés.
 *
 * Next lit la session de chaque requête dans un contexte asynchrone propre à
 * cette requête (cookies() / headers()). On le reproduit avec un
 * AsyncLocalStorage : `auth()` renvoie la session du contexte courant, comme
 * si deux personnes appelaient le même processus serveur.
 */
const requete = new AsyncLocalStorage<{ qui: string; session: unknown; delai?: number }>();
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

const sessionDe = (qui: string) => ({
  user: { id: `id-${qui}`, email: `${qui}@cn.test`, name: qui, role: "ADMIN", status: "ACTIVE", accessToken: `jeton-${qui}` },
  expires: "2099-01-01T00:00:00.000Z",
});

const deconnexions: string[] = [];
mock.module("@/lib/auth", () => ({
  auth: async () => {
    const ctx = requete.getStore();
    // Lecture du cookie de session : asynchrone, durée variable selon la requête.
    await pause(ctx?.delai ?? 1);
    return ctx?.session ?? null;
  },
  signOut: async () => {
    deconnexions.push(requete.getStore()?.qui ?? "personne");
  },
  signIn: async () => {},
  handlers: {},
}));
// Action de déconnexion (redirect de next/navigation) : simulée elle aussi.
mock.module("@/features/auth/actions/auth.action", () => ({
  logout: async () => {
    deconnexions.push(requete.getStore()?.qui ?? "personne");
  },
  login: async () => ({ success: false }),
  refresh: async () => ({ success: false }),
}));

// Adaptateur axios simulé : aucune requête ne part, on note qui appelle quoi
// et avec quel en-tête Authorization.
const appels: { qui: string; methode: string; url: string; authorization: string | null }[] = [];
let statutReponse = 200;
axios.defaults.adapter = async (config) => {
  const h = config.headers ?? {};
  const authorization = (typeof h.get === "function" ? h.get("Authorization") : h.Authorization) ?? null;
  appels.push({
    qui: requete.getStore()?.qui ?? "personne",
    methode: String(config.method).toUpperCase(),
    url: String(config.url),
    authorization: authorization ? String(authorization) : null,
  });
  // Réponse lente : les requêtes concurrentes se chevauchent vraiment.
  await pause(3);
  const reponse = {
    data: { data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } },
    status: statutReponse,
    statusText: statutReponse === 200 ? "OK" : "Erreur",
    headers: {},
    config,
    request: {},
  };
  if (statutReponse >= 400) {
    const erreur = new axios.AxiosError(`Request failed with status code ${statutReponse}`, "ERR_BAD_REQUEST", config, {}, reponse);
    throw erreur;
  }
  return reponse;
};

// Import APRÈS les simulations (les modules lisent axios et la session au chargement).
let actions: typeof import("./utilisateur.action");
let commentaireAPI: typeof import("@/features/client/commentaire.api").commentaireAPI;
beforeAll(async () => {
  actions = await import("./utilisateur.action");
  commentaireAPI = (await import("@/features/client/commentaire.api")).commentaireAPI;
});

afterEach(() => {
  appels.length = 0;
  deconnexions.length = 0;
  statutReponse = 200;
});

const en = <T,>(qui: string | null, fn: () => Promise<T>, delai?: number) =>
  requete.run({ qui: qui ?? "anonyme", session: qui ? sessionDe(qui) : null, delai }, fn);

describe("actions serveur des comptes du personnel", () => {
  it("jeton A puis jeton B : chaque appel porte le jeton de SA session", async () => {
    const a = await en("A", () => actions.obtenirTousUtilisateursAction({ page: 1, limit: 5 }));
    const b = await en("B", () => actions.obtenirTousUtilisateursAction({ page: 1, limit: 5 }));
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(appels.map((x) => [x.qui, x.authorization])).toEqual([
      ["A", "Bearer jeton-A"],
      ["B", "Bearer jeton-B"],
    ]);
  });

  it("appels concurrents A et B sur le même processus : aucun mélange", async () => {
    for (let tour = 0; tour < 5; tour++) {
      // Délais croisés : la session de A arrive après celle de B, puis l'inverse.
      await Promise.all([
        en("A", () => actions.obtenirTousUtilisateursAction({ page: 1 }), tour % 2 ? 2 : 8),
        en("B", () => actions.obtenirUnUtilisateurAction("x"), tour % 2 ? 8 : 2),
        en("C", () => actions.supprimerUtilisateurAction("y"), 5),
      ]);
    }
    expect(appels.length).toBe(15);
    for (const appel of appels) {
      expect(appel.authorization).toBe(`Bearer jeton-${appel.qui}`);
    }
  });

  it("action privée sans session : refusée, sans aucun appel réseau", async () => {
    // Un membre du personnel s'est connecté et a utilisé le tableau de bord...
    await en("A", () => actions.obtenirTousUtilisateursAction({ page: 1 }));
    appels.length = 0;
    // ... puis un inconnu appelle les actions par POST direct, sans session.
    const resultats = await en(null, async () => [
      await actions.obtenirTousUtilisateursAction({ page: 1 }),
      await actions.obtenirUnUtilisateurAction("x"),
      await actions.ajouterUtilisateurAction({ firstName: "Pi", lastName: "Rate", email: "p@r.te", phoneNumber: "0102030405", role: "ADMIN" }),
      await actions.modifierProfilAction("x", { role: "ADMIN" }),
      await actions.supprimerUtilisateurAction("x"),
    ]);
    for (const r of resultats) {
      expect(r.success).toBe(false);
      expect(r.data).toBeUndefined();
      expect(r.error).toBe("Connectez-vous pour continuer.");
    }
    expect(appels).toEqual([]);
  });

  it("session sans jeton (cookie incomplet) : refusée aussi", async () => {
    const r = await requete.run({ qui: "D", session: { user: { id: "id-D", accessToken: "" } } }, () =>
      actions.obtenirTousUtilisateursAction({ page: 1 })
    );
    expect(r.success).toBe(false);
    expect(appels).toEqual([]);
  });

  it("un 401 de l'API ne déconnecte que l'auteur de la requête, et B garde son jeton", async () => {
    statutReponse = 401;
    const a = await en("A", () => actions.obtenirTousUtilisateursAction({ page: 1 }));
    expect(a.success).toBe(false);
    expect(deconnexions).toEqual(["A"]);
    statutReponse = 200;
    const b = await en("B", () => actions.obtenirTousUtilisateursAction({ page: 1 }));
    expect(b.success).toBe(true);
    expect(appels.at(-1)).toMatchObject({ qui: "B", authorization: "Bearer jeton-B" });
  });
});

describe("appels publics (accueil, avis, promotions, connexion)", () => {
  it("partent sans jeton, même quand un membre du personnel est connecté", async () => {
    await en("A", () => commentaireAPI.obtenirMeilleursCommentaires({ page: 1, limit: 3 }));
    await en(null, () => commentaireAPI.obtenirMeilleursCommentaires({ page: 1, limit: 3 }));
    expect(appels.map((x) => [x.url.split("?")[0], x.authorization])).toEqual([
      ["/comments/bests", null],
      ["/comments/bests", null],
    ]);
  });

  it("le client partagé n'envoie aucun jeton, même pour une route privée passée par erreur", async () => {
    const { api } = await import("@/lib/api");
    // `service` absent : « private » par défaut dans ak-api-http.
    await en("A", () => api.request({ endpoint: "/users", method: "GET" }));
    await en("B", () => api.request({ endpoint: "/users", method: "GET" }));
    expect(appels.map((x) => x.authorization)).toEqual([null, null]);
  });

  it("un 401 sur une route publique ne déconnecte personne", async () => {
    statutReponse = 401;
    await en("A", () => commentaireAPI.obtenirMeilleursCommentaires({ page: 1, limit: 3 }).catch(() => null));
    expect(deconnexions).toEqual([]);
  });
});
