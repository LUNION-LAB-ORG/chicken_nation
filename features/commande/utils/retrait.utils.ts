import { lireHoraires } from "@/features/restaurants/restaurant.utils";

/**
 * Horaires d'un restaurant pour le retrait, à l'heure d'Abidjan (UTC+0).
 * `schedule` : [{"1":"10:00-00:30"}, ...], 1 = lundi, 7 = dimanche ; une
 * fermeture avant l'ouverture veut dire « après minuit ».
 */

const MINUTE = 60 * 1000;
const PREPARATION_MIN = 20;
const PAS_MIN = 15;

function minutes(h: string) {
  const [hh, mm] = h.split(":").map(Number);
  return hh * 60 + (mm || 0);
}

/** Jour 1..7 (lundi..dimanche) d'une date UTC. */
const jourDe = (d: Date) => (d.getUTCDay() === 0 ? 7 : d.getUTCDay());

/**
 * Plage d'ouverture qui contient `maintenant`, en dates absolues, ou null.
 *
 * Même règle que le serveur (RestaurantService.isRestaurantOpen), qui décide
 * d'accepter la commande : seules les plages DU JOUR comptent ; une plage qui
 * passe minuit ("10:00-01:00") court de l'ouverture du jour jusqu'au lendemain.
 */
export function plageOuverte(schedule: string | null, maintenant = new Date()): { debut: Date; fin: Date } | null {
  const jour = jourDe(maintenant);
  const base = Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate());
  const t = maintenant.getTime();
  for (const c of lireHoraires(schedule).filter((x) => x.jour === jour)) {
    const debut = base + minutes(c.ouverture) * MINUTE;
    let fin = base + minutes(c.fermeture) * MINUTE;
    if (fin < debut) fin += 24 * 60 * MINUTE;
    if (t >= debut && t <= fin) return { debut: new Date(debut), fin: new Date(fin) };
  }
  return null;
}

/** Heures de retrait proposées : par quart d'heure, du temps de préparation à la fermeture. */
export function creneauxRetrait(schedule: string | null, maintenant = new Date()): Date[] {
  const plage = plageOuverte(schedule, maintenant);
  if (!plage) return [];
  const pas = PAS_MIN * MINUTE;
  const premier = Math.ceil((maintenant.getTime() + PREPARATION_MIN * MINUTE) / pas) * pas;
  const resultat: Date[] = [];
  for (let t = premier; t <= plage.fin.getTime() - pas && resultat.length < 40; t += pas) resultat.push(new Date(t));
  return resultat;
}

export function heureLisible(d: Date) {
  return `${String(d.getUTCHours()).padStart(2, "0")}h${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
