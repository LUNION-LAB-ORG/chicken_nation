// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";
import { createStore } from "jotai";

import { signatureLigne } from "../utils/panier.utils";

import {
  adresseAtom,
  allerEtapeAtom,
  AVANTAGES_VIDES,
  avantagesAtom,
  caisseAtom,
  etapeAtom,
  etapeVueAtom,
  heureRetraitAtom,
  lireCaisseGardee,
  modeAtom,
  oublierAvantagesAtom,
  restaurantIdAtom,
} from "./caisse.store";
import {
  panierAtom,
  remplacerLigneAtom,
  retirerHorsModeAtom,
} from "./panier.store";

const ligne = (dish_id, quantite = 1, modes = []) => ({
  cle: signatureLigne(dish_id, false, [], []),
  dish_id,
  nom: dish_id.toUpperCase(),
  image: "",
  prixUnitaire: 5000,
  epice: false,
  options: [],
  supplements: [],
  quantite,
  available_order_types: modes,
});

describe("choix gardés (cn-caisse)", () => {
  it("une valeur abîmée du navigateur est remise d'aplomb", () => {
    expect(lireCaisseGardee(null)).toEqual({
      mode: "DELIVERY",
      adresse: null,
      restaurantId: null,
    });
    expect(
      lireCaisseGardee({
        mode: "TABLE",
        adresse: { libelle: "Rue", latitude: "x" },
        restaurantId: 4,
      }),
    ).toEqual({
      mode: "DELIVERY",
      adresse: null,
      restaurantId: null,
    });
    expect(
      lireCaisseGardee({
        mode: "PICKUP",
        adresse: { libelle: "Angré", latitude: 5.39, longitude: -3.98 },
        restaurantId: "r1",
      }),
    ).toEqual({
      mode: "PICKUP",
      adresse: {
        libelle: "Angré",
        latitude: 5.39,
        longitude: -3.98,
        repere: "",
      },
      restaurantId: "r1",
    });
  });

  it("mode, adresse et restaurant s'écrivent sans effacer les autres", () => {
    const s = createStore();
    const adresse = {
      libelle: "Angré",
      latitude: 5.39,
      longitude: -3.98,
      repere: "Portail bleu",
    };

    s.set(adresseAtom, adresse);
    s.set(modeAtom, "PICKUP");
    s.set(restaurantIdAtom, "r1");
    expect(s.get(caisseAtom)).toEqual({
      mode: "PICKUP",
      adresse,
      restaurantId: "r1",
    });
  });

  it("changer de restaurant remet l'heure à « dès que possible »", () => {
    const s = createStore();

    s.set(restaurantIdAtom, "r1");
    s.set(heureRetraitAtom, "2026-10-05T18:15:00.000Z");
    s.set(restaurantIdAtom, "r1");
    expect(s.get(heureRetraitAtom)).toBe("2026-10-05T18:15:00.000Z");
    s.set(restaurantIdAtom, "r2");
    expect(s.get(heureRetraitAtom)).toBeNull();
  });
});

describe("étapes", () => {
  it("l'étape vue la plus avancée ne recule pas", () => {
    const s = createStore();

    s.set(allerEtapeAtom, 4);
    s.set(allerEtapeAtom, 2);
    expect(s.get(etapeAtom)).toBe(2);
    expect(s.get(etapeVueAtom)).toBe(4);
  });
});

describe("avantages en mémoire", () => {
  it("le code ne vaut que pour le panier sur lequel il a été vérifié", () => {
    const s = createStore();

    s.set(panierAtom, [ligne("box")]);
    s.set(avantagesAtom, { code: { code: "BIENVENUE", remise: 1000 } });
    expect(s.get(avantagesAtom).code).toEqual({
      code: "BIENVENUE",
      remise: 1000,
    });
    s.set(panierAtom, [ligne("box", 2)]);
    expect(s.get(avantagesAtom).code).toBeNull();
  });

  it("points et cadeaux restent quand le panier change, tout part quand il se vide", () => {
    const s = createStore();

    s.set(panierAtom, [ligne("box")]);
    s.set(avantagesAtom, { points: 120 });
    s.set(avantagesAtom, { cadeaux: ["r1"], epiceCadeaux: { r1: true } });
    s.set(panierAtom, [ligne("box", 3)]);
    expect(s.get(avantagesAtom)).toEqual({
      code: null,
      points: 120,
      cadeaux: ["r1"],
      epiceCadeaux: { r1: true },
    });
    s.set(panierAtom, []);
    expect(s.get(avantagesAtom)).toEqual(AVANTAGES_VIDES);
  });

  it("autre client : tout est oublié", () => {
    const s = createStore();

    s.set(panierAtom, [ligne("box")]);
    s.set(avantagesAtom, { points: 120, cadeaux: ["r1"] });
    s.set(oublierAvantagesAtom);
    expect(s.get(avantagesAtom)).toEqual(AVANTAGES_VIDES);
  });
});

describe("gestes du panier", () => {
  it("remplacerLigneAtom met la ligne modifiée à sa place", () => {
    const s = createStore();

    s.set(panierAtom, [ligne("a"), ligne("b"), ligne("c")]);
    s.set(remplacerLigneAtom, {
      index: 1,
      ligne: ligne("b", 4),
      cleAvant: ligne("b").cle,
    });
    expect(s.get(panierAtom).map((l) => `${l.dish_id}×${l.quantite}`)).toEqual([
      "a×1",
      "b×4",
      "c×1",
    ]);
  });

  it("retirerHorsModeAtom retire ce qui ne se livre pas", () => {
    const s = createStore();

    s.set(panierAtom, [ligne("a"), ligne("babatche", 1, ["PICKUP"])]);
    s.set(retirerHorsModeAtom, "DELIVERY");
    expect(s.get(panierAtom).map((l) => l.dish_id)).toEqual(["a"]);
  });
});
