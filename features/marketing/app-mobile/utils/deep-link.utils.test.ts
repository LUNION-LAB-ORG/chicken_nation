// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  lienAppli,
  libelleSuivi,
  lireCibleDeepLink,
  lireCodeParrainage,
} from "./deep-link.utils";

// Copie fidèle de la lecture côté appli (deeplink.manager.ts : parse, parseQueryParams,
// début de handle) pour vérifier que l'appli comprend le lien construit par le site.
const SCHEME = "chickennation";
const HANDLERS = [
  "menu",
  "home",
  "category",
  "order",
  "vouchers",
  "loyalty",
  "nation-card",
];

function lectureAppli(url: string) {
  if (!url.startsWith(`${SCHEME}://`)) return null;
  const path = url.replace(`${SCHEME}://`, "");
  const cleanPath = path.split("?")[0];
  const [type, id] = cleanPath.split("/");
  const qs = url.includes("?") ? url.split("?")[1] : "";
  const options: Record<string, string | number | boolean> = {};

  for (const pair of qs ? qs.split("&") : []) {
    const [k, v] = pair.split("=");

    if (!k) continue;
    const dk = decodeURIComponent(k);
    const dv = v ? decodeURIComponent(v) : "";

    if (!isNaN(Number(dv)) && dv !== "") options[dk] = Number(dv);
    else if (dv === "true") options[dk] = true;
    else if (dv === "false") options[dk] = false;
    else options[dk] = dv;
  }
  const ref =
    options.ref != null && String(options.ref).trim()
      ? String(options.ref).trim().toUpperCase()
      : null;

  return { type, id, ref, handler: HANDLERS.includes(type) ? type : null };
}

// Parcours complet de la page : paramètres → lien appli + clic enregistré.
function parcours(query: string) {
  const p = new URLSearchParams(query);
  const cible = lireCibleDeepLink(p);
  const ref = lireCodeParrainage(p.get("ref"));

  if (cible.genre !== "fixe") return { cible, ref };
  const lien = lienAppli(SCHEME, cible.chemin, ref);

  return {
    lien,
    type: cible.type,
    label: libelleSuivi(cible.libelle, ref),
    appli: lectureAppli(lien),
  };
}

describe("page de repli /app-mobile/deep-link", () => {
  it("?to=nation-card ouvre la Carte de la Nation", () => {
    const r = parcours("to=nation-card");

    expect(r.lien).toBe("chickennation://nation-card");
    expect(r.type).toBe("nation_card");
    expect(r.label).toBe("Carte de la Nation");
    expect(r.appli).toEqual({
      type: "nation-card",
      id: undefined,
      ref: null,
      handler: "nation-card",
    });
  });

  it("?ref=ABC123 garde le code jusqu'à l'appli (accueil)", () => {
    const r = parcours("ref=ABC123");

    expect(r.lien).toBe("chickennation://home?ref=ABC123");
    expect(r.type).toBe("home");
    expect(r.label).toBe("Accueil (parrainage ABC123)");
    expect(r.appli).toEqual({
      type: "home",
      id: undefined,
      ref: "ABC123",
      handler: "home",
    });
  });

  it("les deux ensemble", () => {
    const r = parcours("to=nation-card&ref=cn7kq2px");

    expect(r.lien).toBe("chickennation://nation-card?ref=CN7KQ2PX");
    expect(r.type).toBe("nation_card");
    expect(r.appli?.handler).toBe("nation-card");
    expect(r.appli?.ref).toBe("CN7KQ2PX");
  });

  it("autres cibles de ?to= de la liste blanche", () => {
    expect(parcours("to=loyalty").lien).toBe("chickennation://loyalty");
    expect(parcours("to=vouchers").lien).toBe("chickennation://vouchers");
    expect(parcours("to=home").lien).toBe("chickennation://home");
    expect(parcours("to=Nation-Card").lien).toBe("chickennation://nation-card");
    expect(parcours("to=%20nation-card%20").lien).toBe(
      "chickennation://nation-card",
    );
    // Espaces et retours à la ligne autour : retirés, le chemin vient de la liste blanche.
    expect(parcours("to=nation-card%0d%0a").lien).toBe(
      "chickennation://nation-card",
    );
  });

  it("valeurs piégées de ?to= : accueil", () => {
    for (const q of [
      "to=javascript:alert(1)",
      "to=javascript%3Aalert(document.cookie)",
      "to=../..",
      "to=..%2F..%2Fadmin",
      "to=https://evil.example",
      "to=menu", // un plat demande un identifiant
      "to=order",
      "to=constructor",
      "to=__proto__",
      "to=toString",
      "to=nation-card%00",
      "to=nation-card/x",
      "to=",
    ]) {
      const r = parcours(q);

      expect(r.lien).toBe("chickennation://home");
      expect(r.type).toBe("home");
      expect(r.appli?.handler).toBe("home");
    }
  });

  it("valeurs piégées de ?ref= : code écarté, cible conservée", () => {
    for (const q of [
      "ref=" + "A".repeat(21), // trop long
      "ref=AB1", // trop court
      "ref=ABC%26to%3Dloyalty", // tente d'ajouter un paramètre
      "ref=ABC%3Fx%3D1",
      "ref=AB%20C123",
      "ref=%3Cscript%3E",
      "ref=ABC-123",
      "ref=123456", // l'appli en ferait un nombre
      "ref=0X1F", // Number() lit l'hexadécimal
      "ref=1E5",
      "ref=",
      "ref=%C3%89COLE1", // É : pas un code
    ]) {
      const r = parcours(q + "&to=nation-card");

      expect(r.lien).toBe("chickennation://nation-card");
      expect(r.label).toBe("Carte de la Nation");
      expect(r.appli?.ref).toBeNull();
    }
  });

  it("code de parrainage : bornes et normalisation", () => {
    expect(lireCodeParrainage("  cnabc234 ")).toBe("CNABC234");
    expect(lireCodeParrainage("ABCD")).toBe("ABCD");
    expect(lireCodeParrainage("A".repeat(20))).toBe("A".repeat(20));
    expect(lireCodeParrainage(null)).toBeNull();
  });

  it("sans paramètre : accueil, comme avant", () => {
    const r = parcours("");

    expect(r.lien).toBe("chickennation://home");
    expect(r.type).toBe("home");
    expect(r.label).toBe("Accueil");
  });

  it("paramètres déjà gérés : inchangés", () => {
    expect(lireCibleDeepLink(new URLSearchParams("category=abc"))).toEqual({
      genre: "categorie",
      id: "abc",
    });
    expect(lireCibleDeepLink(new URLSearchParams("product=xyz"))).toEqual({
      genre: "plat",
      id: "xyz",
    });
    expect(parcours("voucher=true").lien).toBe("chickennation://vouchers");
    expect(parcours("voucher=true").type).toBe("voucher");
    expect(parcours("loyalty=true").lien).toBe("chickennation://loyalty");
    expect(parcours("nation-card=1").lien).toBe("chickennation://nation-card");
    expect(parcours("nation-card=true").type).toBe("nation_card");
    const uuid = "3f2b8c1e-9d4a-4b7e-8f21-0c6d5e4a3b2f";
    const o = parcours(`order=${uuid}&ref=CNABC234`);

    expect(o.lien).toBe(`chickennation://order/${uuid}?ref=CNABC234`);
    expect(o.appli).toEqual({
      type: "order",
      id: uuid,
      ref: "CNABC234",
      handler: "order",
    });
    // Référence lisible : acceptée telle quelle.
    expect(parcours("order=CMD-98765").lien).toBe(
      "chickennation://order/CMD-98765",
    );
    // Identifiant de commande piégé : accueil (l'appli le remettrait sans
    // encodage dans l'adresse de l'API).
    for (const q of [
      "order=../x?y=1",
      "order=..%2F..%2Fadmin",
      "order=abc%2Fdef",
      "order=abc%3Fto%3Dloyalty",
      "order=abc%23x",
      "order=abc%20def",
      "order=" + "a".repeat(65),
    ]) {
      const r = parcours(q + "&ref=CNABC234");

      expect(r.lien).toBe("chickennation://home?ref=CNABC234");
      expect(r.type).toBe("home");
      expect(r.appli?.handler).toBe("home");
      expect(r.appli?.ref).toBe("CNABC234");
    }
    // Un paramètre explicite garde la priorité sur ?to=.
    expect(parcours("loyalty=true&to=nation-card").lien).toBe(
      "chickennation://loyalty",
    );
  });

  it("le lien canonique WhatsApp (www. et /fr/) donne les mêmes paramètres", () => {
    for (const u of [
      "https://www.chicken-nation.com/fr/app-mobile/deep-link?to=nation-card",
      "https://chicken-nation.com/app-mobile/deep-link?to=nation-card",
    ]) {
      const p = new URL(u).searchParams;
      const c = lireCibleDeepLink(p);

      expect(c.genre === "fixe" && c.chemin).toBe("nation-card");
    }
  });
});

describe("drapeaux ?voucher, ?loyalty, ?nation-card (recette liens 8)", () => {
  it("0, false, non ou vide n'ouvrent pas la cible", () => {
    for (const v of ["0", "false", "FALSE", "non", " "]) {
      expect(parcours(`voucher=${v}`).lien).toBe("chickennation://home");
      expect(parcours(`loyalty=${v}`).lien).toBe("chickennation://home");
      expect(parcours(`nation-card=${v}`).lien).toBe("chickennation://home");
    }
    expect(parcours("voucher=1").lien).toBe("chickennation://vouchers");
    expect(parcours("nation-card=true").lien).toBe(
      "chickennation://nation-card",
    );
  });
});
