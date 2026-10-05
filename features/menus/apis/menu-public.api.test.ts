// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { afterEach, describe, expect, it } from "bun:test";

import { obtenirCartePublique } from "./menu-public.api";

import { baseURL } from "@/config/api";

const fetchOrigine = globalThis.fetch;
let appels = [];

function reponse(corps, status = 200) {
  globalThis.fetch = async (url, init) => {
    appels.push({ url: String(url), init });

    return new Response(
      typeof corps === "string" ? corps : JSON.stringify(corps),
      { status },
    );
  };
}
afterEach(() => {
  globalThis.fetch = fetchOrigine;
  appels = [];
});

const plat = (id, name, prix, categorie, extra = {}) => ({
  id,
  name,
  description: "Burger Patron, Frites",
  price: prix,
  is_promotion: false,
  promotion_price: null,
  image: "chicken-nation/dishes/1.jpg",
  entity_status: "ACTIVE",
  category: { id: "c", name: categorie },
  // Champs lourds de la réponse réelle, jamais gardés.
  dish_supplements: [{ supplement: { name: "SAUCE" } }],
  dish_restaurants: [{ restaurant: { phone: "0720353535", manager: "x" } }],
  ...extra,
});

describe("lecture de la carte publique", () => {
  it("lit GET /dishes avec l'en-tête composable, gardée 15 minutes sous l'étiquette carte", async () => {
    reponse([
      plat("939cf341-a", "BOX 2K26 PRO", 10000, "NOS BOX", {
        is_promotion: true,
        promotion_price: 4500,
      }),
      plat("29cd5e84-a", "MENU À COMPOSER", 6000, "NOS BOX", {
        composable: true,
      }),
    ]);
    const carte = await obtenirCartePublique();

    expect(appels).toHaveLength(1);
    expect(appels[0].url).toBe(`${baseURL}/dishes`);
    expect(appels[0].init.headers).toEqual({ "x-app-composable": "1" });
    expect(appels[0].init.next).toEqual({ revalidate: 900, tags: ["carte"] });
    expect(carte.map((c) => [c.cle, c.plats.map((p) => p.nom)])).toEqual([
      ["promotions", ["BOX 2K26 PRO"]],
      ["box", ["BOX 2K26 PRO", "MENU À COMPOSER"]],
    ]);
    // Aucun reste de la réponse brute (suppléments, restaurants et leurs numéros).
    expect(JSON.stringify(carte)).not.toMatch(
      /dish_supplements|dish_restaurants|0720353535|manager/,
    );
  });

  it("accepte aussi une réponse paginée { data }", async () => {
    reponse({ data: [plat("a1", "FRITE ET COCA", 2000, "COMBOS")] });
    expect((await obtenirCartePublique()).map((c) => c.cle)).toEqual([
      "combos",
    ]);
  });

  it("lève une erreur si l'API répond mal : Next garde alors la dernière carte valide", async () => {
    reponse({ message: "erreur" }, 500);
    await expect(obtenirCartePublique()).rejects.toThrow(
      "GET /dishes a répondu 500",
    );
    reponse({ message: "pas une liste" });
    await expect(obtenirCartePublique()).rejects.toThrow(
      "ne renvoie pas de liste",
    );
    reponse("<html>");
    await expect(obtenirCartePublique()).rejects.toThrow();
  });
});
