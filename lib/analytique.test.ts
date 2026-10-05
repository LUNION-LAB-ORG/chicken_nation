// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, describe, expect, it } from "bun:test";

import { evenementCommerce, evenementGA, ID_GA, SCRIPT_GA } from "./analytique";

/** Exécute le chargeur écrit dans le HTML avec un faux navigateur. */
function executerChargeur({
  hote = "www.chicken-nation.com",
  etat = "loading",
} = {}) {
  const ajoutes = [];
  const ecouteurs = {};
  const fenetre = {
    requestIdleCallback: (f) => f(),
    addEventListener: (type, f) => (ecouteurs[type] = f),
  };
  const document = {
    readyState: etat,
    createElement: () => ({}),
    head: { appendChild: (s) => ajoutes.push(s) },
  };

  // Le script s'adresse à `window`, `dataLayer` et `gtag` comme dans une page.
  new Function(
    "window",
    "document",
    "location",
    "dataLayer",
    `${SCRIPT_GA}; window.gtag = gtag;`,
  )(
    new Proxy(fenetre, {
      get: (c, k) => (k in c ? c[k] : undefined),
      has: (c, k) => k in c,
    }),
    document,
    { hostname: hote },
    (fenetre.dataLayer = []),
  );

  return { fenetre, ajoutes, ecouteurs };
}

describe("chargeur Google Analytics", () => {
  it("configure la mesure tout de suite et ne charge Google qu'après la page", () => {
    const { fenetre, ajoutes, ecouteurs } = executerChargeur();

    expect(fenetre.dataLayer.map((a) => a[0])).toEqual(["js", "config"]);
    expect(fenetre.dataLayer[1][1]).toBe(ID_GA);
    expect(ajoutes).toHaveLength(0);
    ecouteurs.load();
    expect(ajoutes).toHaveLength(1);
    expect(ajoutes[0].async).toBe(true);
    expect(ajoutes[0].src).toBe(
      `https://www.googletagmanager.com/gtag/js?id=${ID_GA}`,
    );
  });

  it("charge Google au repos si la page est déjà chargée", () => {
    expect(executerChargeur({ etat: "complete" }).ajoutes).toHaveLength(1);
  });

  it("n'envoie rien à Google depuis un poste de développement", () => {
    for (const hote of ["localhost", "127.0.0.1", "[::1]"]) {
      const { ajoutes, ecouteurs, fenetre } = executerChargeur({
        hote,
        etat: "complete",
      });

      expect(ajoutes).toHaveLength(0);
      expect(ecouteurs.load).toBeUndefined();
      expect(fenetre.dataLayer).toHaveLength(2);
    }
  });
});

describe("événements GA4", () => {
  afterEach(() => {
    delete globalThis.window;
  });

  it("sans effet hors du navigateur ou sans chargeur", () => {
    expect(() => evenementGA("view_item")).not.toThrow();
    globalThis.window = {};
    expect(() => evenementGA("view_item")).not.toThrow();
  });

  it("événement de commerce en XOF, valeur calculée sur les articles", () => {
    const recus = [];

    globalThis.window = { gtag: (...a) => recus.push(a) };
    evenementCommerce("add_to_cart", [
      { item_id: "p1", item_name: "BOX", price: 5500, quantity: 2 },
    ]);
    evenementCommerce("purchase", [], {
      transaction_id: "ORD-1",
      value: 12000,
    });
    expect(recus).toEqual([
      [
        "event",
        "add_to_cart",
        {
          currency: "XOF",
          value: 11000,
          items: [
            { item_id: "p1", item_name: "BOX", price: 5500, quantity: 2 },
          ],
        },
      ],
      [
        "event",
        "purchase",
        { currency: "XOF", transaction_id: "ORD-1", value: 12000, items: [] },
      ],
    ]);
  });

  it("une mesure qui échoue ne casse pas la page", () => {
    globalThis.window = {
      gtag: () => {
        throw new Error("bloqué");
      },
    };
    expect(() => evenementGA("purchase", {})).not.toThrow();
  });
});
