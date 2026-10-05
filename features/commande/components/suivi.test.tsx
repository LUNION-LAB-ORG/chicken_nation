// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Hors de Next, le routeur n'existe pas : les boutons qui naviguent reçoivent
// un routeur factice (rien n'est cliqué dans ces tests de rendu). Le reste du
// module (usePathname...) reste le vrai.
const navigation = await import("next/navigation");

mock.module("next/navigation", () => ({
  ...navigation,
  useRouter: () => ({ push() {}, refresh() {}, replace() {}, prefetch() {} }),
}));

const { versCommande } = await import("../utils/commande.utils");
const { etapesFrise } = await import("../utils/suivi.utils");
const { FriseSuivi, PastilleStatut } = await import("./FriseSuivi");
const { CarteCommande, MesCommandes, PanneauCompte } = await import(
  "./MesCommandes"
);
const { default: SuiviCommande } = await import("./SuiviCommande");
const { EnteteEcran } = await import("./EnteteEcran");

// Le texte rendu, sans balises ni insécables, pour lire les phrases.
const texte = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/[  ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Motifs [html] et [texte] de scripts/interdits.txt (annexe A du plan).
function motifsInterdits() {
  const motifs = [];
  let section = "";

  for (const brute of fs
    .readFileSync(path.join(process.cwd(), "scripts", "interdits.txt"), "utf8")
    .split("\n")) {
    const ligne = brute.trim();

    if (!ligne || ligne.startsWith("#")) continue;
    if (/^\[\w+\]$/.test(ligne)) {
      section = ligne;
      continue;
    }
    if (section !== "[relire]")
      motifs.push(new RegExp(ligne.replace(/\s+@sauf\s+\S+$/, "")));
  }

  return motifs;
}
const sansInterdit = (html) => {
  const lisible = html.replace(/[  ]/g, " ");

  for (const m of motifsInterdits()) expect(lisible).not.toMatch(m);
};

/** Seuls liens tel: permis : le 27 21 71 21 30. */
const seulNumero = (html) => {
  const liens = html.match(/href="tel:[^"]*"/g) ?? [];

  for (const l of liens) expect(l).toBe('href="tel:+2252721712130"');
};

const BRUT = {
  id: "c0ffee00-0000-4000-8000-000000000003",
  reference: "ORD-261002-58332",
  type: "PICKUP",
  status: "ACCEPTED",
  paied: true,
  payment_method: "ONLINE",
  net_amount: 37000,
  discount: 0,
  points: 0,
  tax: 370,
  delivery_fee: 0,
  amount: 37370,
  created_at: "2026-10-02T08:15:03.099Z",
  time: "08:15",
  recovery_code: "8348",
  accepted_at: "2026-10-02T08:16:07.917Z",
  restaurant: {
    id: "r1",
    name: "CHICKEN NATION ZONE 4",
    address: "488 Av. N'guetta Timothée Ahoua, Abidjan, Côte d'Ivoire",
    phone: "0102030405",
  },
  order_items: [
    {
      dish_id: "plat-menu",
      quantity: 2,
      unit_price: 6000,
      line_total: 15000,
      epice: false,
      options: [{ id: "cheddar", label: "Cheddar", price_delta: 500 }],
      supplements: [
        { id: "coca", name: "COCA", price: 1000, quantity: 1, offert: false },
      ],
      dish: {
        id: "plat-menu",
        name: "MENU À COMPOSER",
        price: 6000,
        image: "",
      },
    },
  ],
};
const PAYEE = versCommande(BRUT);
const A_PAYER = versCommande({
  ...BRUT,
  id: "c0ffee00-0000-4000-8000-000000000004",
  reference: "ORD-261002-12765",
  type: "DELIVERY",
  status: "PENDING",
  paied: false,
  accepted_at: null,
  delivery_fee: 1500,
  amount: 16870,
  address: JSON.stringify({
    address: "Cocody, rue des Jardins",
    note: "Portail bleu",
  }),
});
const LIVREE = versCommande({
  ...BRUT,
  type: "DELIVERY",
  status: "COMPLETED",
  completed_at: "2026-10-02T09:01:00Z",
  address: JSON.stringify({ address: "Cocody" }),
});
const CLIENT = {
  id: "client",
  phone: "+2250102030405",
  first_name: "Awa",
  last_name: "Test",
  email: null,
};
const suivi = (commande, props = {}) =>
  renderToStaticMarkup(
    <SuiviCommande
      client={CLIENT}
      id={commande.id}
      lectureInitiale={{
        ok: true,
        data: { commande, paiement: { public_key: "cle-test", sandbox: true } },
      }}
      ouvrirPaiement={false}
      pointsParFranc={0.01}
      {...props}
    />,
  );

describe("EnteteEcran", () => {
  it("un seul H1 en police d'affiche, focusable par programme", () => {
    const html = renderToStaticMarkup(
      <EnteteEcran id="titre-x" titre="Mes commandes" />,
    );

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('id="titre-x"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain("font-affiche");
    expect(html).toContain('aria-labelledby="titre-x"');
  });
});

describe("FriseSuivi et PastilleStatut", () => {
  it("étape en cours marquée, heures des étapes franchies", () => {
    const html = renderToStaticMarkup(
      <FriseSuivi etapes={etapesFrise(PAYEE)} />,
    );

    expect(html.match(/aria-current="step"/g)).toHaveLength(1);
    expect(texte(html)).toContain(
      "Confirmée 8 h 16 · Le restaurant a accepté votre commande.",
    );
    expect(texte(html)).toContain("Prête au comptoir À venir");
    expect(html.match(/<h3/g)).toHaveLength(4);
  });

  it("pastille : libellé de l'état, couleur de l'annulation", () => {
    expect(
      texte(renderToStaticMarkup(<PastilleStatut commande={A_PAYER} />)),
    ).toBe("En attente de paiement");
    const annulee = renderToStaticMarkup(
      <PastilleStatut commande={{ ...A_PAYER, status: "CANCELLED" }} />,
    );

    expect(texte(annulee)).toBe("Annulée");
    expect(annulee).toContain("bg-rouge-fond");
    expect(annulee).toContain("whitespace-nowrap");
  });
});

describe("SuiviCommande", () => {
  it("payée en retrait : H1, référence jamais coupée, frise, code, points, lieu, seul numéro", () => {
    const html = suivi(PAYEE);
    const t = texte(html);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(t).toContain("Suivi de commande");
    expect(html).toContain(
      `<span class="whitespace-nowrap">ORD-261002-58332</span>`,
    );
    // Sur téléphone, la pastille passe sous la référence.
    expect(html).toContain("flex flex-col items-start");
    expect(t).toContain("Où en est votre commande ?");
    expect(html).toContain('aria-label="Code 8 3 4 8"');
    expect(t).toContain("+370 points crédités");
    expect(t).toContain(
      "1 point par tranche de 100 FCFA de plats payés en ligne",
    );
    expect(t).toContain(
      "Une carte à gratter vous attend dans l'application Chicken Nation.",
    );
    expect(html).toContain("Disponible sur Google Play");
    expect(t).toContain("Chicken Nation Marcory Zone 4");
    expect(t).toContain("Dès que possible.");
    expect(t).toContain("Une question ? Appelez le 27 21 71 21 30");
    expect(html).toContain('href="/fr/restaurants/zone-4"');
    expect(t).not.toContain("Recommander");
    expect(t).not.toContain("Payer");
    expect(html).not.toContain("0102030405");
    seulNumero(html);
    sansInterdit(html);
  });

  it("non payée en livraison : paiement et « Modifier », pas de frise ni de code", () => {
    const html = suivi(A_PAYER);
    const t = texte(html);

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(t).toContain("16 870 FCFA à payer");
    // Module KKiaPay pas encore prêt au rendu : bouton désactivé.
    expect(t).toContain("Préparation du paiement…");
    expect(t).toContain("Modifier ma commande");
    expect(t).not.toContain("Où en est votre commande");
    expect(t).not.toContain("Code de récupération");
    expect(t).not.toContain("points crédités");
    expect(t).toContain("Cocody, rue des Jardins");
    expect(t).toContain("Repère : Portail bleu");
    expect(t).toContain("Préparée au restaurant Marcory Zone 4.");
    seulNumero(html);
    sansInterdit(html);
  });

  it("livrée : « Commande terminée », « Recommander », plus de code", () => {
    const t = texte(suivi(LIVREE));

    expect(t).toContain("Commande terminée");
    expect(t).toContain("Recommander");
    expect(t).not.toContain("Code de récupération");
  });

  it("annulée : expliquée, « Recommander » ; taux illisible : aucun point annoncé", () => {
    const t = texte(
      suivi({ ...A_PAYER, status: "CANCELLED" }, { pointsParFranc: null }),
    );

    expect(t).toContain("Commande annulée");
    expect(t).toContain("Recommander");
    expect(t).not.toContain("Modifier ma commande");
    expect(texte(suivi(PAYEE, { pointsParFranc: null }))).not.toContain(
      "points crédités",
    );
  });

  it("commande introuvable : message et « Mes commandes » ; session expirée : « Recharger » ; H1 présent", () => {
    const html = renderToStaticMarkup(
      <SuiviCommande
        client={CLIENT}
        id="x"
        lectureInitiale={{
          ok: false,
          message: "Commande introuvable.",
          statut: 404,
        }}
        ouvrirPaiement={false}
        pointsParFranc={null}
      />,
    );

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(texte(html)).toContain(
      "Cette commande est introuvable. Elle a peut-être été remplacée par une nouvelle commande. Mes commandes",
    );
    expect(html).toContain('role="alert"');
    expect(html).toContain('href="/fr/commander/mes-commandes"');
    // Session expirée : « Recharger ».
    const expiree = renderToStaticMarkup(
      <SuiviCommande
        client={CLIENT}
        id="x"
        lectureInitiale={{
          ok: false,
          message: "Votre session a expiré. Reconnectez-vous.",
          statut: 401,
        }}
        ouvrirPaiement={false}
        pointsParFranc={null}
      />,
    );

    expect(texte(expiree)).toContain(
      "Votre session a expiré. Reconnectez-vous. Recharger",
    );
  });
});

describe("Mes commandes", () => {
  const compte = {
    solde: 640,
    niveau: "vip",
    cadeaux: ["Box offerte"],
    reglages: {
      pointsParFranc: 0.001,
      valeurPoint: 20,
      minimum: 50,
      plafondPct: 50,
      joursValidite: 365,
    },
  };

  it("Mon compte : niveau, points et leur valeur, cadeaux, règles, déconnexion", () => {
    const t = texte(
      renderToStaticMarkup(<PanneauCompte client={CLIENT} compte={compte} />),
    );

    expect(t).toContain("Mon compte Niveau VIP");
    expect(t).toContain("Awa Test 01 02 03 04 05");
    expect(t).toContain("Points 640 soit 12 800 FCFA");
    expect(t).toContain("Cadeaux 1 Box offerte");
    expect(t).toContain(
      "utilisables dès 50 points, jusqu'à la moitié des plats, pendant 365 jours.",
    );
    expect(t).toContain("Se déconnecter");
  });

  it("Mon compte sans fidélité lisible : ni points ni règles inventés", () => {
    const t = texte(
      renderToStaticMarkup(<PanneauCompte client={CLIENT} compte={null} />),
    );

    expect(t).not.toContain("Points");
    expect(t).not.toContain("FCFA");
    expect(t).toContain("Se déconnecter");
  });

  it("une commande : référence, date, état, plats, lieu, total, points", () => {
    const t = texte(
      renderToStaticMarkup(
        <CarteCommande commande={PAYEE} pointsParFranc={0.001} />,
      ),
    );

    expect(t).toContain("ORD-261002-58332 · 2 oct., 8 h 15");
    expect(t).toContain("Confirmée");
    expect(t).toContain("2 × MENU À COMPOSER");
    expect(t).toContain(
      "Retrait · Chicken Nation Marcory Zone 4 · 37 370 FCFA · +37 points",
    );
  });

  it("liste : payer et modifier, suivre, recommander ; un seul H2 par bloc", () => {
    const html = renderToStaticMarkup(
      <MesCommandes
        client={CLIENT}
        commandes={{ ok: true, data: [A_PAYER, PAYEE, LIVREE] }}
        compte={{ ok: true, data: compte }}
      />,
    );
    const t = texte(html);

    expect(t).toContain("Payer 16 870 FCFA Modifier ma commande");
    expect(html).toContain(
      'href="/fr/commander/c0ffee00-0000-4000-8000-000000000004"',
    );
    expect(t).toContain("Suivre la commande");
    expect(t).toContain("Recommander Voir le détail");
    expect(html.match(/<h2/g)).toHaveLength(2);
    expect(html.match(/<h3/g)).toHaveLength(3);
    expect(html).not.toContain("<h1");
    seulNumero(html);
    sansInterdit(html);
  });

  it("commande sans lignes : ni « Recommander » ni ligne de plats vide", () => {
    const html = renderToStaticMarkup(
      <MesCommandes
        client={CLIENT}
        commandes={{ ok: true, data: [{ ...LIVREE, lignes: [] }] }}
        compte={{ ok: false, message: "x" }}
      />,
    );

    expect(texte(html)).not.toContain("Recommander");
    expect(texte(html)).toContain("Voir le détail");
    expect(html).not.toContain("<br/>");
  });

  it("aucune commande : invitation à voir la carte ; erreur de l'API : dite", () => {
    const vide = texte(
      renderToStaticMarkup(
        <MesCommandes
          client={CLIENT}
          commandes={{ ok: true, data: [] }}
          compte={{ ok: false, message: "x" }}
        />,
      ),
    );

    expect(vide).toContain("Aucune commande pour le moment. Voir la carte");
    const erreur = renderToStaticMarkup(
      <MesCommandes
        client={CLIENT}
        commandes={{
          ok: false,
          message: "Le service est momentanément indisponible.",
        }}
        compte={{ ok: false, message: "x" }}
      />,
    );

    expect(erreur).toContain('role="alert"');
    expect(texte(erreur)).toContain(
      "Le service est momentanément indisponible.",
    );
  });
});
