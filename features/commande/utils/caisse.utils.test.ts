// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  decisionPaiement,
  ETAPES_CAISSE,
  etapeAccessible,
  etapeMaximale,
  livraisonPrete,
  obstacleLivraison,
  panierDeLaCommande,
  signatureCommande,
} from "./caisse.utils";
import { signatureLigne } from "./panier.utils";

import { INSECABLE as _ } from "@/lib/typo";

const PRET = {
  panierPret: true,
  connecte: true,
  livraisonPrete: true,
  avantagesPrets: true,
};

describe("étape la plus avancée", () => {
  it("cinq étapes dans l'ordre de la maquette", () => {
    expect(ETAPES_CAISSE.map((e) => e.libelle)).toEqual([
      "Panier",
      "Connexion",
      "Livraison ou retrait",
      "Avantages",
      "Paiement",
    ]);
  });

  it("s'arrête à la première étape qui n'est pas prête", () => {
    expect(etapeMaximale(PRET)).toBe(5);
    expect(etapeMaximale({ ...PRET, avantagesPrets: false })).toBe(4);
    expect(
      etapeMaximale({ ...PRET, livraisonPrete: false, avantagesPrets: false }),
    ).toBe(3);
    expect(etapeMaximale({ ...PRET, connecte: false })).toBe(2);
    expect(etapeMaximale({ ...PRET, panierPret: false })).toBe(1);
  });

  it("une étape demandée trop loin est ramenée au possible", () => {
    const sansAdresse = { ...PRET, livraisonPrete: false };

    expect(etapeAccessible(5, sansAdresse)).toBe(3);
    expect(etapeAccessible(2, sansAdresse)).toBe(2);
    expect(etapeAccessible(0, PRET)).toBe(1);
    expect(etapeAccessible(Number.NaN, PRET)).toBe(1);
  });
});

describe("livraison ou retrait", () => {
  const adresse = {
    libelle: "Cocody Angré",
    latitude: 5.39,
    longitude: -3.98,
    repere: "",
  };
  const LIVRAISON = {
    mode: "DELIVERY",
    livraisonOuverte: true,
    adresse,
    fraisConnus: true,
    horsMode: [],
    retrait: null,
    heure: null,
  };
  const creneau = new Date(Date.UTC(2026, 9, 5, 18, 15));
  const ouvert = { ouvert: true, absents: [], creneaux: [creneau] };
  const RETRAIT = {
    ...LIVRAISON,
    mode: "PICKUP",
    adresse: null,
    retrait: ouvert,
  };

  it("livraison prête : adresse et frais connus, aucun article à emporter", () => {
    expect(livraisonPrete(LIVRAISON)).toBe(true);
    expect(obstacleLivraison({ ...LIVRAISON, adresse: null })).toBe(
      "Choisissez une adresse de livraison pour continuer.",
    );
    expect(obstacleLivraison({ ...LIVRAISON, fraisConnus: false })).toMatch(
      /frais de livraison/,
    );
    expect(obstacleLivraison({ ...LIVRAISON, horsMode: ["BABATCHÊ"] })).toBe(
      "Passez en retrait ou retirez les articles à emporter pour continuer.",
    );
    expect(obstacleLivraison({ ...LIVRAISON, livraisonOuverte: false })).toBe(
      `La livraison est momentanément indisponible${_}: passez en retrait.`,
    );
  });

  it("retrait prêt : restaurant ouvert qui propose tout, heure parmi les créneaux", () => {
    expect(livraisonPrete(RETRAIT)).toBe(true);
    expect(livraisonPrete({ ...RETRAIT, heure: creneau.toISOString() })).toBe(
      true,
    );
    expect(
      obstacleLivraison({ ...RETRAIT, heure: "2026-10-05T03:00:00.000Z" }),
    ).toBe("Choisissez une heure de retrait pour continuer.");
    expect(obstacleLivraison({ ...RETRAIT, retrait: null })).toBe(
      "Choisissez un restaurant ouvert pour continuer.",
    );
    expect(
      obstacleLivraison({ ...RETRAIT, retrait: { ...ouvert, ouvert: false } }),
    ).toBe(
      `Ce restaurant est fermé en ce moment${_}: choisissez un restaurant ouvert.`,
    );
    expect(
      obstacleLivraison({
        ...RETRAIT,
        retrait: { ...ouvert, absents: ["WINGS"] },
      }),
    ).toBe(`Ce restaurant ne propose pas${_}: WINGS. Choisissez-en un autre.`);
  });
});

describe("commande créée, pas encore payée", () => {
  const ligne = (quantite = 1) => ({
    cle: signatureLigne("box", false, [], []),
    dish_id: "box",
    nom: "BOX",
    image: "",
    prixUnitaire: 5000,
    epice: false,
    options: [],
    supplements: [],
    quantite,
    available_order_types: [],
  });
  const BASE = {
    mode: "DELIVERY",
    lignes: [ligne()],
    adresse: {
      libelle: "Cocody Angré",
      latitude: 5.39,
      longitude: -3.98,
      repere: "Portail bleu",
    },
    restaurantId: null,
    heureRetrait: null,
    code: null,
    points: 0,
    cadeaux: [],
  };

  it("même panier, mêmes choix : même signature (ordre des cadeaux indifférent)", () => {
    const a = { ...BASE, cadeaux: [{ id: "r1" }, { id: "r2", epice: true }] };
    const b = { ...BASE, cadeaux: [{ id: "r2", epice: true }, { id: "r1" }] };

    expect(signatureCommande(a)).toBe(signatureCommande(b));
  });

  it("tout ce qui change le contenu ou le prix change la signature", () => {
    const s = signatureCommande(BASE);

    expect(signatureCommande({ ...BASE, lignes: [ligne(2)] })).not.toBe(s);
    expect(
      signatureCommande({
        ...BASE,
        adresse: { ...BASE.adresse, repere: "Portail vert" },
      }),
    ).not.toBe(s);
    expect(
      signatureCommande({
        ...BASE,
        adresse: { ...BASE.adresse, latitude: 5.4 },
      }),
    ).not.toBe(s);
    expect(signatureCommande({ ...BASE, code: "BIENVENUE" })).not.toBe(s);
    expect(signatureCommande({ ...BASE, points: 120 })).not.toBe(s);
    expect(
      signatureCommande({ ...BASE, cadeaux: [{ id: "r1", epice: true }] }),
    ).not.toBe(
      signatureCommande({ ...BASE, cadeaux: [{ id: "r1", epice: false }] }),
    );
    expect(
      signatureCommande({ ...BASE, mode: "PICKUP", restaurantId: "r" }),
    ).not.toBe(s);
  });

  it("panier de la commande payée sur le suivi : vidé seulement s'il n'a pas changé (recette 1)", () => {
    const s = signatureCommande(BASE);

    expect(panierDeLaCommande(s, [ligne()])).toBe(true);
    // Plat ajouté depuis : ce panier-là reste.
    expect(panierDeLaCommande(s, [ligne(2)])).toBe(false);
    expect(panierDeLaCommande(s, [])).toBe(false);
    expect(panierDeLaCommande("pas du json", [ligne()])).toBe(false);
  });

  it("au clic « Payer » : réutiliser, remplacer ou créer", () => {
    const s = signatureCommande(BASE);

    expect(decisionPaiement(null, s)).toBe("creer");
    expect(
      decisionPaiement({ id: "c1", reference: "ORD-1", signature: s }, s),
    ).toBe("reutiliser");
    expect(
      decisionPaiement(
        { id: "c1", reference: "ORD-1", signature: s },
        signatureCommande({ ...BASE, points: 120 }),
      ),
    ).toBe("remplacer");
  });
});
