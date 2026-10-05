// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import { lignePanierDepuisCommande, versCommande } from "./commande.utils";
import { signatureLigne } from "./panier.utils";

// Forme de GET /orders/:id/client (order.service, findById), réduite aux champs lus.
const API = {
  id: "c0ffee00-0000-4000-8000-000000000001",
  reference: "ORD-261005-12345",
  type: "PICKUP",
  status: "IN_PROGRESS",
  paied: true,
  payment_method: "ONLINE",
  net_amount: 13500,
  discount: 0,
  points: 0,
  tax: 140,
  delivery_fee: 0,
  amount: 13640,
  created_at: "2026-10-05T12:00:00.000Z",
  date: "2026-10-05T12:30:00.000Z",
  recovery_code: "4821",
  accepted_at: "2026-10-05T12:02:00.000Z",
  prepared_at: "2026-10-05T12:05:00.000Z",
  ready_at: null,
  picked_up_at: null,
  collected_at: null,
  completed_at: null,
  restaurant: {
    id: "r1",
    name: "CHICKEN NATION ZONE 4",
    address: "488 Av. N'guetta",
    phone: "0720353535",
    email: "zone4@exemple.test",
  },
  order_items: [
    {
      dish_id: "plat-menu",
      quantity: 2,
      amount: 12000,
      unit_price: 6000,
      options_price: 3000,
      line_total: 13500,
      epice: true,
      options: [
        {
          id: "cheddar",
          label: "Cheddar",
          group_name: "Sauce",
          price_delta: 500,
        },
      ],
      supplements: [
        {
          id: "coca",
          name: "COCA",
          price: 1000,
          quantity: 2,
          category: "DRINK",
          offert: false,
        },
        {
          id: "eau",
          name: "EAU",
          price: 0,
          quantity: 1,
          category: "DRINK",
          offert: true,
        },
      ],
      dish: {
        id: "plat-menu",
        name: "MENU À COMPOSER",
        price: 6000,
        image: "https://cdn.exemple.test/menu.jpg",
      },
    },
    {
      dish_id: "plat-offert",
      quantity: 1,
      amount: 0,
      unit_price: 0,
      options_price: 0,
      line_total: 0,
      epice: false,
      options: [],
      supplements: [],
      dish: { id: "plat-offert", name: "WINGS", price: 3000, image: null },
    },
  ],
};

describe("versCommande", () => {
  const c = versCommande(API);

  it("n'emporte jamais le numéro ni le courriel du restaurant", () => {
    expect(c.restaurant).toEqual({
      id: "r1",
      name: "CHICKEN NATION ZONE 4",
      address: "488 Av. N'guetta",
    });
    expect(JSON.stringify(c)).not.toMatch(/0720353535|zone4@/);
  });

  it("garde les heures du suivi", () => {
    expect(c.heures).toEqual({
      accepted_at: "2026-10-05T12:02:00.000Z",
      prepared_at: "2026-10-05T12:05:00.000Z",
      ready_at: null,
      picked_up_at: null,
      collected_at: null,
      completed_at: null,
    });
  });

  it("garde de quoi recommander : plat, choix, suppléments, cadeaux", () => {
    const [menu, offert] = c.lignes;

    expect(menu).toMatchObject({
      dish_id: "plat-menu",
      nom: "MENU À COMPOSER",
      image: "https://cdn.exemple.test/menu.jpg",
      quantite: 2,
      montant: 13500,
      options: ["Cheddar"],
      option_item_ids: ["cheddar"],
      supplements: ["2 × COCA", "1 × EAU (offert)"],
      epice: true,
      offert: false,
    });
    expect(menu.supplementsChoisis).toEqual([
      { id: "coca", nom: "COCA", quantite: 2, offert: false },
      { id: "eau", nom: "EAU", quantite: 1, offert: true },
    ]);
    expect(offert.offert).toBe(true);
    expect(offert.image).toBe("");
  });

  it("une réponse ancienne, sans heures ni identifiants, reste lisible", () => {
    const vieille = versCommande({
      id: "x",
      order_items: [{ quantity: 1, amount: 2000, dish: { name: "BOX" } }],
    });

    expect(vieille.heures.accepted_at).toBeNull();
    expect(vieille.lignes[0]).toMatchObject({
      nom: "BOX",
      montant: 2000,
      option_item_ids: [],
      supplementsChoisis: [],
      offert: false,
    });
  });
});

describe("lignePanierDepuisCommande (« Recommander »)", () => {
  const PLAT = {
    id: "plat-menu",
    name: "MENU À COMPOSER",
    description: "",
    image: "https://cdn.exemple.test/menu.jpg",
    prix: 6500,
    prixAvantPromo: null,
    spice_level: "OPTIONAL",
    available_order_types: ["DELIVERY", "PICKUP"],
    available_from: null,
    available_until: null,
    restaurantsExclus: [],
    groupes: [
      {
        id: "g-sauce",
        name: "Sauce",
        description: null,
        min_select: 1,
        max_select: 1,
        position: 0,
        items: [
          {
            id: "cheddar",
            label: "Cheddar",
            price_delta: 700,
            is_default: false,
            available: true,
            position: 0,
          },
        ],
      },
    ],
    supplements: [
      {
        id: "coca",
        name: "COCA",
        price: 1000,
        category: "DRINK",
        available_order_types: [],
        image: null,
        position: 0,
      },
    ],
  };
  const [menu, offert] = versCommande(API).lignes;

  it("mêmes choix et suppléments payants, aux prix du jour", () => {
    const l = lignePanierDepuisCommande(menu, PLAT);

    expect(l.quantite).toBe(2);
    expect(l.epice).toBe(true);
    expect(l.prixUnitaire).toBe(6500);
    expect(l.options).toEqual([
      {
        item_id: "cheddar",
        group_id: "g-sauce",
        label: "Cheddar",
        price_delta: 700,
      },
    ]);
    // L'eau offerte ne revient pas : un cadeau ne se recommande pas.
    expect(l.supplements.map((s) => `${s.id}×${s.quantite}`)).toEqual([
      "coca×2",
    ]);
    expect(l.cle).toBe(
      signatureLigne("plat-menu", true, l.options, l.supplements),
    );
  });

  it("rien pour un plat offert, retiré ou plus vendu en ligne", () => {
    expect(
      lignePanierDepuisCommande(offert, { ...PLAT, id: "plat-offert" }),
    ).toBeNull();
    expect(lignePanierDepuisCommande(menu, null)).toBeNull();
    expect(
      lignePanierDepuisCommande(menu, {
        ...PLAT,
        available_order_types: ["TABLE"],
      }),
    ).toBeNull();
  });

  it("épicé imposé par le plat d'aujourd'hui", () => {
    expect(
      lignePanierDepuisCommande(menu, { ...PLAT, spice_level: "NEVER" }).epice,
    ).toBe(false);
  });
});
