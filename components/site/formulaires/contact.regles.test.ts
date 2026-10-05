// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import { erreurChamp, VALEURS_VIDES, verifierContact } from "./contact.regles";

const BON = {
  nom: "Koné",
  prenom: "Awa",
  email: "awa@exemple.test",
  telephone: "+225 05 05 05 05 05",
  message: "Bonjour",
};

describe("règles du formulaire de contact", () => {
  it("formulaire complet : aucune erreur", () => {
    expect(verifierContact(BON)).toEqual({});
  });

  it("formulaire vide : une erreur par champ", () => {
    expect(Object.keys(verifierContact(VALEURS_VIDES))).toEqual([
      "nom",
      "prenom",
      "email",
      "telephone",
      "message",
    ]);
  });

  it("espaces seuls refusés, comme le trim de la route", () => {
    expect(erreurChamp("nom", "   ")).not.toBeNull();
    expect(erreurChamp("message", " a ")).not.toBeNull();
  });

  it("adresse électronique et téléphone : même tolérance que la route", () => {
    expect(erreurChamp("email", "awa@exemple")).not.toBeNull();
    expect(erreurChamp("email", "awa exemple.test")).not.toBeNull();
    expect(erreurChamp("telephone", "05 05")).not.toBeNull();
    expect(erreurChamp("telephone", "appelez-moi")).not.toBeNull();
    expect(erreurChamp("telephone", "(+225) 05.05.05-05-05")).toBeNull();
  });

  it("longueurs maximales de la route", () => {
    expect(erreurChamp("nom", "a".repeat(81))).toBe("80 caractères au plus.");
    expect(erreurChamp("message", "a".repeat(3001))).toBe(
      "3 000 caractères au plus.",
    );
    expect(erreurChamp("message", "a".repeat(3000))).toBeNull();
  });
});
