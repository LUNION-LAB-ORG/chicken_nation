// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  erreurCommentaire,
  erreurPrenom,
  erreursExperience,
  erreursNumero,
  erreurTelephone,
  mobileIvoirien,
  nettoyerCommentaire,
} from "../utils/regles-avis";
import { SAISIE_VIDE } from "../utils/parcours-avis";
import { ERREURS_AVIS } from "../utils/textes-avis";

import { premierMessage, schemaAvis } from "./avis.schema";

const _ = " ";
const UUID = "6b1e3f4a-2c5d-4e6f-8a9b-0c1d2e3f4a5b";

/** Envoi tel que le navigateur le passe à l'action. */
const envoi = (x = {}) => ({
  ressenti: "PAS_CONTENT",
  canal: "TELEPHONE",
  restaurant_id: UUID,
  commentaire: "Commande arrivée froide.",
  telephone: "07 07 12 34 56",
  prenom: "",
  accord_rappel: false,
  source: "site",
  site_web: "",
  ...x,
});

const lire = (x) => schemaAvis.safeParse(envoi(x));
const message = (x) => {
  const r = lire(x);

  expect(r.success).toBe(false);

  return premierMessage(r.error);
};

describe("schéma de l'envoi (action serveur)", () => {
  it("rend le corps exact de POST /avis-prives : numéro canonique, prénom vide → null, sans le piège", () => {
    const r = lire({});

    expect(r.success).toBe(true);
    expect(r.data).toEqual({
      ressenti: "PAS_CONTENT",
      canal: "TELEPHONE",
      restaurant_id: UUID,
      commentaire: "Commande arrivée froide.",
      telephone: "+2250707123456",
      prenom: null,
      accord_rappel: false,
      source: "site",
    });
    expect(Object.keys(r.data)).not.toContain("site_web");
  });

  it("mobiles 07, 05 et 01 normalisés en +225…, sous toutes leurs graphies", () => {
    for (const [saisie, attendu] of [
      ["0707123456", "+2250707123456"],
      ["05 55 12 34 56", "+2250555123456"],
      ["01.02.03.04.05", "+2250102030405"],
      ["+225 07 07 12 34 56", "+2250707123456"],
      ["00225 0707123456", "+2250707123456"],
      ["2250707123456", "+2250707123456"],
    ]) {
      expect(lire({ telephone: saisie }).data.telephone).toBe(attendu);
      expect(mobileIvoirien(saisie)).toBe(attendu);
    }
  });

  it("numéro fixe, étranger, trop court ou vide : refusé avec le message du serveur", () => {
    for (const saisie of [
      "27 21 71 21 30",
      "0807123456",
      "+33 6 12 34 56 78",
      "070712345",
      "",
      "abc",
    ]) {
      expect(message({ telephone: saisie })).toBe(
        "Saisis un numéro mobile à 10 chiffres (07, 05 ou 01).",
      );
      expect(erreurTelephone(saisie)).toBe(ERREURS_AVIS.telephone);
    }
  });

  it("commentaire : 2 à 1 000 caractères après nettoyage", () => {
    expect(message({ commentaire: " a " })).toBe(
      "Raconte-nous ce qui s'est passé.",
    );
    expect(message({ commentaire: "" })).toBe(ERREURS_AVIS.commentaire);
    expect(lire({ commentaire: "ok" }).success).toBe(true);
    expect(lire({ commentaire: "x".repeat(1000) }).success).toBe(true);
    expect(message({ commentaire: "x".repeat(1001) })).toBe(
      `Ton message dépasse 1${_}000 caractères.`,
    );
    // Espaces de bord retirés avant de compter, comme le serveur.
    expect(lire({ commentaire: `  ${"x".repeat(1000)}  ` }).success).toBe(true);
    expect(erreurCommentaire("x".repeat(1001))).toBe(
      ERREURS_AVIS.commentaireTropLong,
    );
  });

  it("commentaire nettoyé comme au serveur : retours chariot, tabulations, caractères de contrôle", () => {
    expect(nettoyerCommentaire("  a\r\nb\tc\u0007d\u0000 ")).toBe("a\nb cd");
    expect(
      lire({ commentaire: "Froid\r\net en retard\u0001" }).data.commentaire,
    ).toBe("Froid\net en retard");
  });

  it("prénom facultatif : 60 caractères au plus, espaces resserrés", () => {
    expect(lire({ prenom: "  Awa   Koné " }).data.prenom).toBe("Awa Koné");
    expect(lire({ prenom: null }).data.prenom).toBeNull();
    expect(lire({ prenom: undefined }).data.prenom).toBeNull();
    expect(lire({ prenom: "x".repeat(60) }).success).toBe(true);
    expect(message({ prenom: "x".repeat(61) })).toBe(
      "Ton prénom ne doit pas dépasser 60 caractères.",
    );
    expect(erreurPrenom("x".repeat(61))).toBe(ERREURS_AVIS.prenomTropLong);
    expect(erreurPrenom("")).toBeNull();
  });

  it("ressenti et canal obligatoires, codes du serveur seulement", () => {
    expect(message({ ressenti: null })).toBe("Choisis ton ressenti.");
    expect(message({ ressenti: "CONTENT" })).toBe("Choisis ton ressenti.");
    expect(message({ canal: "" })).toBe("Choisis comment tu avais commandé.");
    expect(message({ canal: "MANUEL" })).toBe(
      "Choisis comment tu avais commandé.",
    );
    for (const canal of [
      "APPLI",
      "SITE_WEB",
      "TELEPHONE",
      "WHATSAPP",
      "SUR_PLACE",
      "AUTRE_PLATEFORME",
    ])
      expect(lire({ canal }).success).toBe(true);
    for (const ressenti of ["AU_TOP", "PEUT_MIEUX_FAIRE", "PAS_CONTENT"])
      expect(lire({ ressenti }).success).toBe(true);
  });

  it("store : identifiant ou null (« Je ne sais pas »)", () => {
    expect(lire({ restaurant_id: null }).data.restaurant_id).toBeNull();
    expect(lire({ restaurant_id: "" }).data.restaurant_id).toBeNull();
    expect(lire({ restaurant_id: undefined }).data.restaurant_id).toBeNull();
    expect(message({ restaurant_id: "zone-4" })).toBe(
      "Ce store n'existe plus. Choisis-en un autre.",
    );
  });

  it("accord de rappel : faux par défaut, booléen seulement", () => {
    expect(lire({ accord_rappel: undefined }).data.accord_rappel).toBe(false);
    expect(lire({ accord_rappel: true }).data.accord_rappel).toBe(true);
    expect(lire({ accord_rappel: "oui" }).success).toBe(false);
  });

  it("source filtrée par la liste blanche, « site » sinon", () => {
    expect(lire({ source: "marque-page" }).data.source).toBe("marque-page");
    expect(lire({ source: "MARQUE-PAGE" }).data.source).toBe("marque-page");
    expect(lire({ source: "facebook" }).data.source).toBe("site");
    expect(lire({ source: "<script>" }).data.source).toBe("site");
    expect(lire({ source: undefined }).data.source).toBe("site");
  });
});

describe("règles du navigateur (mêmes bornes que le schéma)", () => {
  it("étape 1 : ressenti, canal et commentaire, dans cet ordre", () => {
    expect(erreursExperience(SAISIE_VIDE)).toEqual({
      ressenti: "Choisis ton ressenti.",
      canal: "Choisis comment tu avais commandé.",
      commentaire: "Raconte-nous ce qui s'est passé.",
    });
    expect(
      erreursExperience({
        ...SAISIE_VIDE,
        ressenti: "AU_TOP",
        canal: "APPLI",
        commentaire: "Très bon accueil.",
      }),
    ).toEqual({});
  });

  it("étape 2 : numéro obligatoire, prénom facultatif", () => {
    expect(erreursNumero(SAISIE_VIDE)).toEqual({
      telephone: ERREURS_AVIS.telephone,
    });
    expect(erreursNumero({ ...SAISIE_VIDE, telephone: "0707123456" })).toEqual(
      {},
    );
  });
});
