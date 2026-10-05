import { lireHoraires, regrouperHoraires } from "./horaires";
import { IRestaurantPublic } from "./restaurant.type";
import { restaurantsDuSite } from "./restaurants.site";

import { restaurantSchemaOrg } from "@/lib/seo/restaurant";
import { formatImageUrl } from "@/utils/formatImageUrl";

const JOURS_COURTS = [
  "",
  "lun.",
  "mar.",
  "mer.",
  "jeu.",
  "ven.",
  "sam.",
  "dim.",
];

/**
 * Plages d'ouverture, une entrée par plage : un jour peut en avoir plusieurs,
 * séparées par une virgule ("10:00-14:00,18:00-23:00"), comme le lit le
 * serveur (RestaurantService.isRestaurantOpen). Lecture déplacée dans
 * `horaires.ts`, gardée ici pour la caisse (`retrait.utils.ts`).
 */
export { lireHoraires };

// "10:00" → "10h", "00:30" → "0h30", "00:00" → "minuit"
function heure(h: string) {
  if (h === "00:00") return "minuit";
  const [hh, mm] = h.split(":");

  return `${Number(hh)}h${mm === "00" ? "" : mm}`;
}

export function horairesLisibles(schedule: string | null): string[] {
  return regrouperHoraires(lireHoraires(schedule)).map(({ jours, plages }) => {
    const premier = JOURS_COURTS[jours[0]];
    const dernier = JOURS_COURTS[jours[jours.length - 1]];
    const libelle =
      jours.length === 1
        ? premier
        : jours.length === 2
          ? `${premier} et ${dernier}`
          : `${premier} au ${dernier}`;
    const heures = plages
      .map((p) => `${heure(p.ouverture)} à ${heure(p.fermeture)}`)
      .join(" et ");

    return `${libelle.charAt(0).toUpperCase()}${libelle.slice(1)} : ${heures}`;
  });
}

// "CHICKEN NATION ZONE 4" → "Zone 4"
export function nomCourt(nom: string) {
  const sansMarque = nom.replace(/^CHICKEN NATION\s+/i, "").trim();

  return (
    sansMarque
      .toLowerCase()
      .split(" ")
      .map((mot) => mot.charAt(0).toUpperCase() + mot.slice(1))
      .join(" ")
      // La base enregistre ces noms sans accent.
      .replace(/\bAngre\b/, "Angré")
      .replace(/\bSococe\b/, "Sococé")
  );
}

// "0720353535" → "07 20 35 35 35"
export function telephoneLisible(tel: string) {
  const chiffres = tel.replace(/\D/g, "").replace(/^225/, "");

  return chiffres.length === 10
    ? chiffres.replace(/(\d{2})(?=\d)/g, "$1 ")
    : tel;
}

export function lienItineraire(r: IRestaurantPublic) {
  if (r.latitude == null || r.longitude == null) return null;

  return `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`;
}

export function imageRestaurant(r: IRestaurantPublic) {
  return r.image
    ? formatImageUrl(r.image)
    : "/assets/images/illustrations/restaurant/marcory-1.png";
}

/**
 * Fiches schema.org « Restaurant » de l'ancienne liste des restaurants.
 * Construites par `lib/seo/restaurant.ts` : plus aucun numéro de restaurant,
 * seul le 27 21 71 21 30 est publié (retouche 6).
 * @deprecated La page de chaque restaurant (lot L8) publie son propre nœud ;
 * à retirer avec `components/(public)/restaurant/list.tsx`.
 */
export function restaurantsSchemaOrg(restaurants: IRestaurantPublic[]) {
  return {
    "@context": "https://schema.org",
    "@graph": restaurantsDuSite(restaurants).map((r) => restaurantSchemaOrg(r)),
  };
}
