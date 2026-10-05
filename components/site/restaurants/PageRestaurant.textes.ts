import type { IRestaurantSite } from "@/features/restaurants/restaurants.site";

import { heureTexte, lireHoraires } from "@/features/restaurants/horaires";
import { INSECABLE, TELEPHONE } from "@/lib/typo";

/**
 * Textes des pages restaurants (titres, descriptions, introduction), tirés
 * des données de l'API et de la table du site. Fonctions pures, testées.
 * Aucun numéro de restaurant : seul le 27 21 71 21 30 est cité.
 */

/** Limites du plan (5.1) : titre de 60 caractères, description de 155. */
export const TITRE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/** « a », « a et b », « a, b et c ». */
export function listeNoms(noms: readonly string[]): string {
  if (noms.length <= 1) return noms[0] ?? "";

  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

// Le premier texte qui tient dans la limite, sinon le dernier (le plus court).
const premierQuiTient = (candidats: string[], limite: number) =>
  candidats.find((t) => t.length <= limite) ?? candidats[candidats.length - 1];

const JOUR_ENTIER = (ouverture: string, fermeture: string) =>
  ouverture === "00:00" && (fermeture === "23:59" || fermeture === "00:00");

/**
 * Résumé d'une ligne des horaires : « Ouvert 7 j/7 dès 10 h » quand les sept
 * jours ouvrent à la même heure, « Ouvert 7 j/7, 24 h sur 24 », sinon
 * « Ouvert 6 jours sur 7 dès 10 h » ou « Ouvert 7 j/7 ». Chaîne vide si les
 * horaires sont illisibles. Le détail jour par jour est sur la page.
 */
export function resumeOuverture(schedule: string | null | undefined): string {
  const creneaux = lireHoraires(schedule);
  const jours = new Set(creneaux.map((c) => c.jour));

  if (jours.size === 0) return "";

  // Première ouverture de chaque jour (les plages sont triées par heure).
  const premieres = Array.from(jours).map(
    (j) => creneaux.find((c) => c.jour === j)!,
  );
  const heures = new Set(premieres.map((c) => c.ouverture));
  const semaine = jours.size === 7 ? `7${INSECABLE}j/7` : null;

  if (
    semaine &&
    creneaux.length === 7 &&
    creneaux.every((c) => JOUR_ENTIER(c.ouverture, c.fermeture))
  )
    return `Ouvert ${semaine}, 24${INSECABLE}h sur 24`;

  const des =
    heures.size === 1 ? ` dès ${heureTexte(premieres[0].ouverture)}` : "";

  return semaine
    ? `Ouvert ${semaine}${des}`
    : `Ouvert ${jours.size}${INSECABLE}jours sur 7${des}`;
}

/** Commune du restaurant, « Abidjan » pour un restaurant absent de la table du site. */
const lieu = (r: Pick<IRestaurantSite, "commune">) => r.commune ?? "Abidjan";

/** Titre complet (sans gabarit) : « CHICKEN NATION Angré : adresse et horaires ». */
export function titrePageRestaurant(
  r: Pick<IRestaurantSite, "nomAffiche">,
): string {
  return premierQuiTient(
    [
      `CHICKEN NATION ${r.nomAffiche}${INSECABLE}: adresse et horaires`,
      `CHICKEN NATION ${r.nomAffiche}${INSECABLE}: horaires`,
      `CHICKEN NATION ${r.nomAffiche}`,
    ],
    TITRE_MAX,
  );
}

/**
 * Description de la page d'un restaurant (155 caractères au plus) :
 * « 3897 Avenue Usher Assouan, Cocody. Ouvert 7 j/7 dès 10 h. Commandez en
 * ligne et retirez sur place, ou appelez le 27 21 71 21 30. »
 * Les formes plus courtes servent quand l'adresse est longue.
 */
export function descriptionPageRestaurant(
  r: Pick<
    IRestaurantSite,
    "nomAffiche" | "commune" | "adresseCourte" | "schedule"
  >,
): string {
  const ouverture = resumeOuverture(r.schedule);
  const horaires = ouverture ? ` ${ouverture}.` : "";
  const appel = `Commandez en ligne et retirez sur place, ou appelez le ${TELEPHONE}.`;
  const appelCourt = `Commande en ligne et retrait sur place.`;
  const adresses = r.adresseCourte
    ? [`${r.adresseCourte}, ${lieu(r)}.`, `${r.adresseCourte}.`]
    : [];
  const nom = `CHICKEN NATION ${r.nomAffiche}, ${lieu(r)}.`;

  return premierQuiTient(
    [
      ...adresses.map((a) => `${a}${horaires} ${appel}`),
      `${nom}${horaires} ${appel}`,
      ...adresses.map((a) => `${a}${horaires} ${appelCourt}`),
      `${nom}${horaires} ${appelCourt}`,
    ],
    DESCRIPTION_MAX,
  ).slice(0, DESCRIPTION_MAX);
}

/**
 * Paragraphe d'introduction de la page (texte propre à chaque restaurant,
 * avec sa commune et son adresse).
 */
export function introRestaurant(
  r: Pick<IRestaurantSite, "nomAffiche" | "commune" | "adresseCourte">,
): string {
  const ou = r.adresseCourte
    ? `à ${lieu(r)}, ${r.adresseCourte}`
    : `à ${lieu(r)}`;

  return `Chicken Nation ${r.nomAffiche} vous accueille ${ou}. Commandez en ligne et retirez votre commande sur place, ou faites-vous livrer dans le Grand Abidjan.`;
}

/** Titre de la liste des restaurants (avec le gabarit « | CHICKEN NATION », 60 caractères au plus). */
export const TITRE_LISTE_RESTAURANTS = `Restaurants à Abidjan${INSECABLE}: adresses, horaires`;

/**
 * Description de `/fr/restaurants` : les restaurants tirés de l'API, puis
 * « Ouverts 7 j/7 dès 10 h. Retrait de votre commande sur place. »
 */
export function descriptionListeRestaurants(
  restaurants: readonly Pick<IRestaurantSite, "nomAffiche">[],
): string {
  const fin = `Ouverts 7${INSECABLE}j/7 dès 10${INSECABLE}h. Retrait de votre commande sur place.`;
  const noms = listeNoms(restaurants.map((r) => r.nomAffiche));

  return premierQuiTient(
    [
      ...(noms ? [`Nos restaurants à ${noms}. ${fin}`] : []),
      `Les restaurants CHICKEN NATION à Abidjan${INSECABLE}: adresses, horaires et itinéraires. ${fin}`,
    ],
    DESCRIPTION_MAX,
  );
}
