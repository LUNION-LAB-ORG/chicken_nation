/**
 * Affichage des promotions publiques (« Offres du moment »).
 *
 * Le backoffice enregistre la date de fin sans heure, donc à minuit (Abidjan
 * = UTC) : une offre « jusqu'au 31/10 » disparaît en réalité dès le début du
 * 31/10, côté site comme côté application. On affiche le dernier jour où elle
 * est encore valable.
 */
export function dernierJourValable(expiration: string | Date): Date {
  return new Date(new Date(expiration).getTime() - 1);
}

/** Date au format français, à l'heure d'Abidjan : même rendu serveur et navigateur. */
export function datePromotion(
  date: string | Date,
  mois: "2-digit" | "long" = "2-digit",
): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    timeZone: "Africa/Abidjan",
    day: "2-digit",
    month: mois,
    year: "numeric",
  });
}
