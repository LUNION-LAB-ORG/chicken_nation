import type { ICreneauJour } from "./restaurant.type";

/**
 * Horaires des restaurants, à l'heure d'Abidjan (UTC+0 toute l'année, sans
 * heure d'été) : les calculs lisent l'heure UTC de la date, quel que soit le
 * fuseau de la machine qui les fait.
 *
 * `schedule` (texte JSON de l'API) : [{"1":"10:00-00:30"}, ...], 1 = lundi,
 * 7 = dimanche ; plusieurs plages par jour séparées par une virgule
 * ("10:00-14:00,18:00-23:00") ; une fermeture avant l'ouverture veut dire
 * « après minuit ».
 *
 * L'état « ouvert » suit la règle du serveur (RestaurantService.isRestaurantOpen,
 * reprise par `plageOuverte` de la caisse) pour ne rien promettre que la
 * caisse refuserait : seules les plages DU JOUR comptent. Après minuit, un
 * restaurant qui sert jusqu'à 1 h est donc dit fermé (risque R6 du plan, à
 * corriger côté serveur).
 *
 * Ces calculs dépendent de l'heure : ils se font dans le navigateur après
 * hydratation, jamais dans du HTML mis en cache.
 */

const NBSP = "\u00a0";
const MINUTE = 60 * 1000;
const JOUR = 24 * 60 * MINUTE;

export const NOMS_JOURS = [
  "",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
] as const;

/**
 * Plages d'ouverture, une entrée par plage, triées par jour puis par heure.
 * « Fermé » et toute valeur illisible sont ignorés.
 */
export function lireHoraires(
  schedule: string | null | undefined,
): ICreneauJour[] {
  if (!schedule) return [];
  try {
    const jours = JSON.parse(schedule) as Record<string, string>[];

    if (!Array.isArray(jours)) return [];

    return jours
      .flatMap((j) => Object.entries(j ?? {}))
      .flatMap(([jour, plages]) =>
        String(plages)
          .split(",")
          .map((plage) =>
            plage
              .trim()
              .split("-")
              .map((h) => h.trim()),
          )
          .filter(
            (parts) =>
              parts.length === 2 &&
              parts.every((h) => /^\d{1,2}:\d{2}$/.test(h)),
          )
          .map(([ouverture, fermeture]) => ({
            jour: Number(jour),
            ouverture,
            fermeture,
          })),
      )
      .filter((c) => Number.isInteger(c.jour) && c.jour >= 1 && c.jour <= 7)
      .sort(
        (a, b) =>
          a.jour - b.jour || minutes(a.ouverture) - minutes(b.ouverture),
      );
  } catch {
    return [];
  }
}

function minutes(h: string) {
  const [hh, mm] = h.split(":").map(Number);

  return hh * 60 + (mm || 0);
}

/** Jour 1..7 (lundi..dimanche) à Abidjan. */
export const jourAbidjan = (d: Date) =>
  d.getUTCDay() === 0 ? 7 : d.getUTCDay();

/** « 10:00 » → « 10 h », « 00:30 » → « 0 h 30 », « 00:00 » → « minuit » (espaces insécables). */
export function heureTexte(h: string): string {
  const [hh, mm] = h.split(":").map(Number);

  if (hh % 24 === 0 && mm === 0) return "minuit";

  return `${hh % 24}${NBSP}h${mm ? `${NBSP}${String(mm).padStart(2, "0")}` : ""}`;
}

export interface IEtatOuverture {
  ouvert: boolean;
  /** « Ouvert, ferme à 0 h 30 », « Fermé, ouvre à 10 h », « Fermé, ouvre demain à 10 h ». */
  texte: string;
}

/** Plages d'un jour en dates absolues, à partir du minuit (UTC) de `base`. */
function plagesDuJour(creneaux: ICreneauJour[], jour: number, base: number) {
  return creneaux
    .filter((c) => c.jour === jour)
    .map((c) => {
      const debut = base + minutes(c.ouverture) * MINUTE;
      let fin = base + minutes(c.fermeture) * MINUTE;

      if (fin < debut) fin += JOUR;

      return { ...c, debut, fin };
    });
}

/**
 * Ouvert ou fermé à cet instant, et la prochaine heure utile.
 * Ouvert exactement quand `plageOuverte` (caisse) trouve une plage.
 */
export function etatOuverture(
  schedule: string | null | undefined,
  maintenant: Date = new Date(),
): IEtatOuverture {
  const creneaux = lireHoraires(schedule);
  const t = maintenant.getTime();
  const base = Date.UTC(
    maintenant.getUTCFullYear(),
    maintenant.getUTCMonth(),
    maintenant.getUTCDate(),
  );
  const jour = jourAbidjan(maintenant);
  const aujourdhui = plagesDuJour(creneaux, jour, base);

  const enCours = aujourdhui.find((p) => t >= p.debut && t <= p.fin);

  if (enCours)
    return {
      ouvert: true,
      texte: `Ouvert, ferme à ${heureTexte(enCours.fermeture)}`,
    };

  const plusTard = aujourdhui.find((p) => p.debut > t);

  if (plusTard)
    return {
      ouvert: false,
      texte: `Fermé, ouvre à ${heureTexte(plusTard.ouverture)}`,
    };

  for (let ecart = 1; ecart <= 7; ecart++) {
    const j = ((jour - 1 + ecart) % 7) + 1;
    const premiere = creneaux.find((c) => c.jour === j);

    if (!premiere) continue;
    const quand = ecart === 1 ? "demain" : NOMS_JOURS[j];

    return {
      ouvert: false,
      texte: `Fermé, ouvre ${quand} à ${heureTexte(premiere.ouverture)}`,
    };
  }

  return { ouvert: false, texte: "Fermé" };
}

type Plage = Pick<ICreneauJour, "ouverture" | "fermeture">;

/** Jours consécutifs aux mêmes plages regroupés : lundi à jeudi, puis vendredi et samedi… Jours fermés absents. */
export function regrouperHoraires(
  creneaux: ICreneauJour[],
): { jours: number[]; plages: Plage[] }[] {
  const parJour = new Map<number, Plage[]>();

  for (const c of creneaux)
    parJour.set(c.jour, [...(parJour.get(c.jour) ?? []), c]);
  const groupes: { jours: number[]; plages: Plage[] }[] = [];
  const cle = (p: Plage[]) =>
    p.map((x) => `${x.ouverture}-${x.fermeture}`).join(",");

  for (const [jour, plages] of Array.from(parJour.entries()).sort(
    (a, b) => a[0] - b[0],
  )) {
    const dernier = groupes[groupes.length - 1];
    const suit =
      dernier && dernier.jours[dernier.jours.length - 1] === jour - 1;

    if (suit && cle(dernier.plages) === cle(plages)) dernier.jours.push(jour);
    else groupes.push({ jours: [jour], plages });
  }

  return groupes;
}

const plagesTexte = (plages: Plage[], de = false) =>
  plages
    .map(
      (p) =>
        `${de ? "de " : ""}${heureTexte(p.ouverture)} à ${heureTexte(p.fermeture)}`,
    )
    .join(de ? " et " : ", ");

const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Horaires de la semaine, un jour par ligne (texte statique de la page d'un
 * restaurant et de la bulle « Horaires ») : « 10 h à minuit », « Fermé ».
 */
export function horairesParJour(
  schedule: string | null | undefined,
): { jour: number; nom: string; texte: string }[] {
  const creneaux = lireHoraires(schedule);

  return [1, 2, 3, 4, 5, 6, 7].map((jour) => {
    const plages = creneaux.filter((c) => c.jour === jour);

    return {
      jour,
      nom: majuscule(NOMS_JOURS[jour]),
      texte: plages.length ? plagesTexte(plages) : "Fermé",
    };
  });
}

/**
 * Résumé d'une phrase (description de la page d'un restaurant) :
 * « du lundi au jeudi de 10 h à minuit, vendredi et samedi de 10 h à 0 h 30 ».
 * Chaîne vide si les horaires sont illisibles.
 */
export function resumeHoraires(schedule: string | null | undefined): string {
  return regrouperHoraires(lireHoraires(schedule))
    .map(({ jours, plages }) => {
      const premier = NOMS_JOURS[jours[0]];
      const dernier = NOMS_JOURS[jours[jours.length - 1]];
      const quand =
        jours.length === 7
          ? "tous les jours"
          : jours.length === 1
            ? premier
            : jours.length === 2
              ? `${premier} et ${dernier}`
              : `du ${premier} au ${dernier}`;

      return `${quand} ${plagesTexte(plages, true)}`;
    })
    .join(", ");
}
