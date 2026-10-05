// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  etatOuverture,
  heureTexte,
  horairesParJour,
  lireHoraires,
  regrouperHoraires,
  resumeHoraires,
} from "./horaires";

import { plageOuverte } from "@/features/commande/utils/retrait.utils";

const NBSP = "\u00a0";
const h = (texte) => texte.replace(/ (?=h\b)|(?<=\bh) (?=\d)/g, NBSP);

// Horaires de production du 02/10 (.maquette-site/restaurants.json).
const ZONE_4 =
  '[{"1":"10:00-00:00"},{"2":"10:00-00:00"},{"3":"10:00-00:00"},{"4":"10:00-00:00"},{"5":"10:00-00:30"},{"6":"10:00-00:30"},{"7":"10:00-00:45"}]';
const PRODUCTION = [
  '[{"1":"10:00-00:00"},{"2":"10:00-00:00"},{"3":"10:00-00:00"},{"4":"10:00-00:00"},{"5":"10:00-01:00"},{"6":"10:00-01:00"},{"7":"10:00-01:00"}]',
  '[{"1":"10:00-00:00"},{"2":"10:00-00:00"},{"3":"10:00-00:00"},{"4":"10:00-00:30"},{"5":"10:00-00:45"},{"6":"10:00-00:30"},{"7":"10:00-00:30"}]',
  '[{"1":"10:00-23:45"},{"2":"10:00-00:00"},{"3":"10:00-00:00"},{"4":"10:00-00:00"},{"5":"10:00-00:00"},{"6":"10:00-00:30"},{"7":"10:00-00:30"}]',
  ZONE_4,
  '[{"1":"10:00-00:00"},{"2":"10:00-00:00"},{"3":"10:00-00:00"},{"4":"10:00-00:00"},{"5":"10:00-00:30"},{"6":"10:00-00:30"},{"7":"10:00-00:30"}]',
];
const DEUX_PLAGES =
  '[{"1":"10:00-14:00,18:00-23:00"},{"2":"10:00-14:00,18:00-23:00"}]';

// Le 05/10/2026 est un lundi. Heures UTC = heures d'Abidjan.
const le = (jour, heure) =>
  new Date(`2026-10-${String(jour).padStart(2, "0")}T${heure}:00Z`);

describe("état d'ouverture, à l'heure d'Abidjan", () => {
  it("ouvert : ferme à minuit, à 0 h 30, à 0 h 45", () => {
    expect(etatOuverture(ZONE_4, le(5, "15:00"))).toEqual({
      ouvert: true,
      texte: "Ouvert, ferme à minuit",
    });
    expect(etatOuverture(ZONE_4, le(9, "23:59"))).toEqual({
      ouvert: true,
      texte: h("Ouvert, ferme à 0 h 30"),
    });
    expect(etatOuverture(ZONE_4, le(11, "10:00"))).toEqual({
      ouvert: true,
      texte: h("Ouvert, ferme à 0 h 45"),
    });
  });

  it("fermé avant l'ouverture : ouvre à 10 h", () => {
    expect(etatOuverture(ZONE_4, le(5, "08:30"))).toEqual({
      ouvert: false,
      texte: h("Fermé, ouvre à 10 h"),
    });
  });

  it("après minuit, suit le serveur : seules les plages du jour comptent (risque R6)", () => {
    // Vendredi 10 h à 0 h 30 : samedi à 0 h 15, le serveur refuse la commande.
    expect(etatOuverture(ZONE_4, le(10, "00:15"))).toEqual({
      ouvert: false,
      texte: h("Fermé, ouvre à 10 h"),
    });
  });

  it("fermé après la dernière plage : ouvre demain", () => {
    const tot = '[{"1":"10:00-22:00"},{"2":"11:30-22:00"}]';

    expect(etatOuverture(tot, le(5, "22:30"))).toEqual({
      ouvert: false,
      texte: h("Fermé, ouvre demain à 11 h 30"),
    });
    // Dimanche soir : demain est lundi.
    expect(
      etatOuverture(
        '[{"1":"10:00-22:00"},{"7":"10:00-22:00"}]',
        le(11, "23:00"),
      ).texte,
    ).toBe(h("Fermé, ouvre demain à 10 h"));
  });

  it("plusieurs plages dans la journée", () => {
    expect(etatOuverture(DEUX_PLAGES, le(5, "12:00"))).toEqual({
      ouvert: true,
      texte: h("Ouvert, ferme à 14 h"),
    });
    expect(etatOuverture(DEUX_PLAGES, le(5, "15:00"))).toEqual({
      ouvert: false,
      texte: h("Fermé, ouvre à 18 h"),
    });
    expect(etatOuverture(DEUX_PLAGES, le(5, "19:00"))).toEqual({
      ouvert: true,
      texte: h("Ouvert, ferme à 23 h"),
    });
    expect(etatOuverture(DEUX_PLAGES, le(5, "23:30"))).toEqual({
      ouvert: false,
      texte: h("Fermé, ouvre demain à 10 h"),
    });
  });

  it("jour sans plage : nomme le prochain jour d'ouverture", () => {
    const sansMardi = '[{"1":"10:00-22:00"},{"3":"10:00-22:00"}]';

    expect(etatOuverture(sansMardi, le(5, "23:00")).texte).toBe(
      h("Fermé, ouvre mercredi à 10 h"),
    );
    expect(etatOuverture(sansMardi, le(6, "12:00")).texte).toBe(
      h("Fermé, ouvre demain à 10 h"),
    );
    expect(etatOuverture('[{"1":"Fermé"}]', le(5, "12:00"))).toEqual({
      ouvert: false,
      texte: "Fermé",
    });
    expect(etatOuverture(null, le(5, "12:00"))).toEqual({
      ouvert: false,
      texte: "Fermé",
    });
    expect(etatOuverture("pas du JSON", le(5, "12:00"))).toEqual({
      ouvert: false,
      texte: "Fermé",
    });
  });

  it("ne dépend pas du fuseau de la machine", () => {
    // 23 h 30 à Paris (UTC+2) le lundi = 21 h 30 à Abidjan.
    const paris = new Date("2026-10-05T23:30:00+02:00");

    expect(etatOuverture('[{"1":"10:00-22:00"}]', paris)).toEqual({
      ouvert: true,
      texte: h("Ouvert, ferme à 22 h"),
    });
    // 1 h du matin le mardi à Paris = 23 h le lundi à Abidjan.
    expect(
      etatOuverture(
        '[{"1":"10:00-23:30"}]',
        new Date("2026-10-06T01:00:00+02:00"),
      ).ouvert,
    ).toBe(true);
  });

  it("dit ouvert exactement quand la caisse accepte un retrait (plageOuverte)", () => {
    const debut = Date.UTC(2026, 9, 5);

    for (const schedule of [
      ...PRODUCTION,
      DEUX_PLAGES,
      '[{"1":"00:00-23:59"}]',
      '[{"3":"18:00-02:00"}]',
    ]) {
      for (
        let t = debut;
        t < debut + 8 * 24 * 3600 * 1000;
        t += 7 * 60 * 1000 + 13 * 1000
      ) {
        const d = new Date(t);

        expect([
          schedule,
          d.toISOString(),
          etatOuverture(schedule, d).ouvert,
        ]).toEqual([
          schedule,
          d.toISOString(),
          plageOuverte(schedule, d) !== null,
        ]);
      }
    }
  });
});

describe("textes des horaires", () => {
  it("écrit les heures à la française, avec des espaces insécables", () => {
    expect(heureTexte("10:00")).toBe(`10${NBSP}h`);
    expect(heureTexte("00:30")).toBe(`0${NBSP}h${NBSP}30`);
    expect(heureTexte("09:05")).toBe(`9${NBSP}h${NBSP}05`);
    expect(heureTexte("00:00")).toBe("minuit");
    expect(heureTexte("23:45")).toBe(`23${NBSP}h${NBSP}45`);
  });

  it("donne la semaine jour par jour", () => {
    expect(horairesParJour(ZONE_4).map((j) => `${j.nom} : ${j.texte}`)).toEqual(
      [
        "Lundi : 10 h à minuit",
        "Mardi : 10 h à minuit",
        "Mercredi : 10 h à minuit",
        "Jeudi : 10 h à minuit",
        "Vendredi : 10 h à 0 h 30",
        "Samedi : 10 h à 0 h 30",
        "Dimanche : 10 h à 0 h 45",
      ].map(h),
    );
    expect(horairesParJour(DEUX_PLAGES)[0].texte).toBe(
      h("10 h à 14 h, 18 h à 23 h"),
    );
    expect(horairesParJour(DEUX_PLAGES)[2].texte).toBe("Fermé");
  });

  it("résume la semaine en une phrase", () => {
    expect(resumeHoraires(ZONE_4)).toBe(
      h(
        "du lundi au jeudi de 10 h à minuit, vendredi et samedi de 10 h à 0 h 30, dimanche de 10 h à 0 h 45",
      ),
    );
    expect(
      resumeHoraires(
        '[{"1":"10:00-00:00"},{"2":"10:00-00:00"},{"3":"10:00-00:00"},{"4":"10:00-00:00"},{"5":"10:00-00:00"},{"6":"10:00-00:00"},{"7":"10:00-00:00"}]',
      ),
    ).toBe(h("tous les jours de 10 h à minuit"));
    expect(resumeHoraires(DEUX_PLAGES)).toBe(
      h("lundi et mardi de 10 h à 14 h et de 18 h à 23 h"),
    );
    expect(resumeHoraires(null)).toBe("");
  });
});

describe("lecture des horaires de l'API", () => {
  it("garde chaque plage valable, triée, et ignore le reste", () => {
    expect(
      lireHoraires(
        '[{"2":"18:00-23:00, 9:30-14:00"},{"1":"Fermé"},{"8":"10:00-12:00"},{"3":"10h-12h"}]',
      ),
    ).toEqual([
      { jour: 2, ouverture: "9:30", fermeture: "14:00" },
      { jour: 2, ouverture: "18:00", fermeture: "23:00" },
    ]);
    expect(lireHoraires("{}")).toEqual([]);
    expect(lireHoraires("")).toEqual([]);
  });

  it("regroupe les jours consécutifs aux mêmes plages", () => {
    expect(regrouperHoraires(lireHoraires(ZONE_4)).map((g) => g.jours)).toEqual(
      [[1, 2, 3, 4], [5, 6], [7]],
    );
  });
});
