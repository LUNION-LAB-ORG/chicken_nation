// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  DELAI_CONFIRMATION_MS,
  DELAI_PROTECTION_MS,
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
  it("gardée le temps de l'onglet, relue, oubliée", () => {
    expect(lireCommandeEnAttente()).toBeNull();
    noterCommandeEnAttente({ id: "c1", reference: "ORD-1", signature: "s" });
    expect(session.cles()).toEqual(["cn-commande-en-attente"]);
    expect(lireCommandeEnAttente()).toEqual({
      id: "c1",
      reference: "ORD-1",
      signature: "s",
    });
    oublierCommandeEnAttente();
    expect(lireCommandeEnAttente()).toBeNull();
  });

  it("valeur abîmée ou stockage bloqué : rien, sans erreur", () => {
    session.setItem("cn-commande-en-attente", "{pas du json");
    expect(lireCommandeEnAttente()).toBeNull();
    session.setItem("cn-commande-en-attente", JSON.stringify({ id: "c1" }));
    expect(lireCommandeEnAttente()).toBeNull();
    globalThis.window = {
      get sessionStorage() {
        throw new Error("bloqué");
      },
    };
    expect(() =>
      noterCommandeEnAttente({ id: "c1", reference: "ORD-1", signature: "s" }),
    ).not.toThrow();
    expect(lireCommandeEnAttente()).toBeNull();
  });
});
