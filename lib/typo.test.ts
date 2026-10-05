// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  estTexteAffiche,
  fcfa,
  INSECABLE as _,
  joli,
  kmTexte,
  nombre,
  phrase,
  pluriel,
  telLien,
  typo,
} from "./typo";

describe("nombre et fcfa", () => {
  it("sépare les milliers par une insécable", () => {
    expect(nombre(999)).toBe("999");
    expect(nombre(12500)).toBe(`12${_}500`);
    expect(nombre(1234567)).toBe(`1${_}234${_}567`);
    expect(nombre(-1500)).toBe(`-1${_}500`);
  });

  it("arrondit", () => {
    expect(nombre(2499.6)).toBe(`2${_}500`);
  });

  it("colle l'unité au montant", () => {
    expect(fcfa(0)).toBe(`0${_}FCFA`);
    expect(fcfa(2500)).toBe(`2${_}500${_}FCFA`);
  });

  it("n'utilise jamais d'espace ordinaire dans un montant", () => {
    expect(fcfa(1250000)).not.toContain(" ");
  });
});

describe("typo", () => {
  it("met une insécable avant : ? ! ; et dans les guillemets", () => {
    expect(typo("Prix : 2 500 FCFA !")).toBe(`Prix${_}: 2${_}500${_}FCFA${_}!`);
    expect(typo("Faim ? Commandez ; c'est prêt")).toBe(
      `Faim${_}? Commandez${_}; c'est prêt`,
    );
    expect(typo("« Délicieux »")).toBe(`«${_}Délicieux${_}»`);
  });

  it("colle % au nombre", () => {
    expect(typo("Poulet 100 % halal")).toBe(`Poulet 100${_}% halal`);
  });

  it("laisse inchangé un texte déjà correct", () => {
    const corrects = [
      "Livré en 20 à 35 min",
      `Prix${_}: 2${_}500${_}FCFA`,
      "Appelez le 27 21 71 21 30",
      "Ouvert 7 j/7 dès 10 h",
      "",
    ];

    for (const t of corrects) expect(typo(t)).toBe(t);
  });

  it("ne touche pas aux numéros de téléphone", () => {
    expect(typo("27 21 71 21 30")).toBe("27 21 71 21 30");
  });
});

describe("joli", () => {
  it("remet en minuscules les noms en capitales, sigles gardés", () => {
    expect(joli("HOT CREAMY BBQ")).toBe("Hot creamy BBQ");
    expect(joli("MENU XL")).toBe("Menu XL");
    expect(joli("PEPPER MAYO BEEF")).toBe("Pepper mayo beef");
  });

  it("nettoie les espaces et écrit les contenances", () => {
    expect(joli("  COCA   COLA 0,5L ")).toBe(`Coca cola 0,5${_}l`);
  });

  it("garde les accents", () => {
    expect(joli("MÉCHANT MÉCHANT")).toBe("Méchant méchant");
  });

  it("supporte une valeur vide", () => {
    expect(joli(null)).toBe("");
    expect(joli(undefined)).toBe("");
  });

  it("laisse inchangé un nom déjà correct", () => {
    expect(joli("Hot creamy BBQ")).toBe("Hot creamy BBQ");
  });
});

describe("phrase", () => {
  it("remet en minuscules les mots courants d'une description à majuscule à chaque mot", () => {
    expect(phrase("4 Morceaux De Poulet Pané Avec Frites Et Boisson")).toBe(
      "4 morceaux de poulet pané avec frites et boisson",
    );
    expect(phrase("Burger Poulet Crispy , Cheddar Et Sauce Au Choix")).toBe(
      "Burger poulet crispy, cheddar et sauce au choix",
    );
  });

  it("garde la majuscule du premier mot et des noms de la marque", () => {
    expect(phrase("Box De La Nation Avec Frites")).toBe(
      "Box de La Nation avec frites",
    );
  });

  it("laisse inchangée une description déjà écrite normalement", () => {
    const t = "Poulet pané, frites et boisson au choix.";

    expect(phrase(t)).toBe(t);
  });

  it("laisse inchangé un texte trop court", () => {
    expect(phrase("Hot Dog")).toBe("Hot Dog");
    expect(phrase(null)).toBe("");
  });
});

describe("pluriel, kmTexte", () => {
  it("accorde et colle le nombre au mot", () => {
    expect(pluriel(0, "plat", "plats")).toBe(`0${_}plat`);
    expect(pluriel(1, "plat", "plats")).toBe(`1${_}plat`);
    expect(pluriel(3, "plat", "plats")).toBe(`3${_}plats`);
    expect(pluriel(1200, "point", "points")).toBe(`1${_}200${_}points`);
  });

  it("écrit les distances avec une virgule", () => {
    expect(kmTexte(2.4)).toBe(`2,4${_}km`);
    expect(kmTexte("12")).toBe(`12${_}km`);
  });
});

describe("telLien", () => {
  it("donne le lien du numéro unique par défaut", () => {
    expect(telLien()).toBe("tel:+2252721712130");
  });

  it("accepte un numéro écrit avec ou sans indicatif", () => {
    expect(telLien("27 21 71 21 30")).toBe("tel:+2252721712130");
    expect(telLien("+225 27 21 71 21 30")).toBe("tel:+2252721712130");
    expect(telLien("01 02 03 04 05")).toBe("tel:+2250102030405");
  });
});

describe("estTexteAffiche", () => {
  it("accepte les textes sans accent ni signe", () => {
    expect(estTexteAffiche("Promotions du moment")).toBe(true);
    expect(estTexteAffiche("Nos 5 restaurants.")).toBe(true);
    expect(estTexteAffiche("Commandez, retirez")).toBe(true);
  });

  it("refuse les accents et les signes que la police n'a pas", () => {
    expect(estTexteAffiche("Équipe")).toBe(false);
    expect(estTexteAffiche("Délicieux")).toBe(false);
    expect(estTexteAffiche("100 %")).toBe(false);
    expect(estTexteAffiche("C'est bon")).toBe(false);
    expect(estTexteAffiche("")).toBe(false);
  });
});
