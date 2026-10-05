// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  DELAI_CONFIRMATION_MS,
  DELAI_PROTECTION_MS,
  DUREE_EN_ATTENTE_MS,
  ecrireMarquePaiement,
  etatPaiement,
  lireCommandeEnAttente,
  lireMarquePaiement,
  lirePanierCommande,
  noterCommandeEnAttente,
  oublierCommandeEnAttente,
  sauverPanierCommande,
} from "./memoire-navigateur.utils";

/** Stockage du navigateur simulé (Bun n'a pas de window). */
function stockage() {
  const m = new Map();

  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    cles: () => Array.from(m.keys()),
  };
}

let local;
let session;

beforeEach(() => {
  local = stockage();
  session = stockage();
  globalThis.window = { localStorage: local, sessionStorage: session };
});
afterEach(() => {
  delete globalThis.window;
});

describe("clés du navigateur inchangées", () => {
  it("cn-paiement-<référence> dans localStorage, cn-panier-commande-<id> le temps de l'onglet", () => {
    ecrireMarquePaiement("ORD-261005-12345", { ouvertA: Date.now() });
    sauverPanierCommande("c1", [{ cle: "a", dish_id: "box" }]);
    expect(local.cles()).toEqual(["cn-paiement-ORD-261005-12345"]);
    expect(session.cles()).toEqual(["cn-panier-commande-c1"]);
    expect(lirePanierCommande("c1")).toHaveLength(1);
  });
});

describe("tentative de paiement", () => {
  it("libre, commencé, confirmation puis vérification", () => {
    const t = 1_000_000_000_000;

    expect(etatPaiement(null, t)).toBe("libre");
    expect(etatPaiement({ ouvertA: t - 60_000 }, t)).toBe("commence");
    expect(etatPaiement({ ouvertA: t - DELAI_PROTECTION_MS - 1 }, t)).toBe(
      "libre",
    );
    expect(etatPaiement({ succesA: t - 1000 }, t)).toBe("confirmation");
    expect(etatPaiement({ succesA: t - DELAI_CONFIRMATION_MS - 1 }, t)).toBe(
      "verification",
    );
    expect(etatPaiement({ succesA: t - DELAI_PROTECTION_MS - 1 }, t)).toBe(
      "commence",
    );
  });

  it("une marque de plus de 24 h est oubliée", () => {
    const t = Date.now();

    ecrireMarquePaiement("ORD-1", { ouvertA: t - 25 * 3600 * 1000 });
    expect(lireMarquePaiement("ORD-1", t)).toBeNull();
    expect(local.cles()).toEqual([]);
  });
});

describe("commande en attente de paiement (étape 5)", () => {
  it("gardée dans localStorage (tous les onglets), relue, oubliée", () => {
    const t = 1_000_000;

    expect(lireCommandeEnAttente()).toBeNull();
    noterCommandeEnAttente(
      { id: "c1", reference: "ORD-1", signature: "s", client: "k1" },
      t,
    );
    expect(local.cles()).toEqual(["cn-commande-en-attente"]);
    expect(session.cles()).toEqual([]);
    expect(lireCommandeEnAttente("k1", t + 1000)).toEqual({
      id: "c1",
      reference: "ORD-1",
      signature: "s",
      client: "k1",
      notee: t,
    });
    oublierCommandeEnAttente();
    expect(lireCommandeEnAttente()).toBeNull();
  });

  it("un second onglet (même stockage local) retrouve la commande du premier (recette 2)", () => {
    noterCommandeEnAttente({
      id: "c1",
      reference: "ORD-1",
      signature: "s",
      client: "k1",
    });
    // Second onglet : sessionStorage neuf, localStorage partagé.
    session = stockage();
    globalThis.window = { localStorage: local, sessionStorage: session };
    expect(lireCommandeEnAttente("k1")?.id).toBe("c1");
  });

  it("jamais proposée à un autre compte, ni au-delà de 2 h", () => {
    const t = 5_000_000;

    noterCommandeEnAttente(
      { id: "c1", reference: "ORD-1", signature: "s", client: "k1" },
      t,
    );
    expect(lireCommandeEnAttente("k2", t)).toBeNull();
    // Gardée pour son client.
    expect(lireCommandeEnAttente("k1", t)?.id).toBe("c1");
    expect(lireCommandeEnAttente("k1", t + DUREE_EN_ATTENTE_MS + 1)).toBeNull();
    expect(local.cles()).toEqual([]);
  });

  it("une ancienne valeur de sessionStorage (avant le 05/10) est encore lue", () => {
    session.setItem(
      "cn-commande-en-attente",
      JSON.stringify({ id: "c0", reference: "ORD-0", signature: "s" }),
    );
    expect(lireCommandeEnAttente("k1")?.id).toBe("c0");
    oublierCommandeEnAttente();
    expect(session.cles()).toEqual([]);
  });

  it("valeur abîmée ou stockage bloqué : rien, sans erreur", () => {
    local.setItem("cn-commande-en-attente", "{pas du json");
    expect(lireCommandeEnAttente()).toBeNull();
    local.setItem("cn-commande-en-attente", JSON.stringify({ id: "c1" }));
    expect(lireCommandeEnAttente()).toBeNull();
    globalThis.window = {
      get sessionStorage() {
        throw new Error("bloqué");
      },
      get localStorage() {
        throw new Error("bloqué");
      },
    };
    expect(() =>
      noterCommandeEnAttente({ id: "c1", reference: "ORD-1", signature: "s" }),
    ).not.toThrow();
    expect(lireCommandeEnAttente()).toBeNull();
  });
});
