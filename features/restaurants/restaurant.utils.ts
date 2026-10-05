import { lireHoraires } from "./horaires";
import { IRestaurantPublic } from "./restaurant.type";

/**
 * Plages d'ouverture, une entrée par plage : un jour peut en avoir plusieurs,
 * séparées par une virgule ("10:00-14:00,18:00-23:00"), comme le lit le
 * serveur (RestaurantService.isRestaurantOpen). Lecture déplacée dans
 * `horaires.ts`, gardée ici pour la caisse (`retrait.utils.ts`).
 */
export { lireHoraires };

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

/** Itinéraire Google Maps jusqu'au restaurant (sans iframe), si la base a sa position. */
export function lienItineraire(r: IRestaurantPublic) {
  if (r.latitude == null || r.longitude == null) return null;

  return `https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`;
}
