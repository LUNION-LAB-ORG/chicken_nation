/**
 * Utilitaires de gestion des numéros de téléphone ivoiriens (Côte d'Ivoire, +225).
 *
 * Depuis 2021 la Côte d'Ivoire utilise une numérotation à 10 chiffres commençant
 * par 0 (ex. 07 07 00 00 00, 05 xx, 01 xx…). Le préfixe international est +225.
 * On accepte donc en entrée les formats suivants (avec ou sans espaces / tirets) :
 *   - 0700000000            (local, 10 chiffres)
 *   - +2250700000000        (international)
 *   - 2250700000000         (international sans +)
 * et on normalise TOUJOURS vers la forme canonique `+2250700000000`.
 */

/** Retourne le numéro normalisé (+225XXXXXXXXXX) ou `null` si invalide. */
export function normalizePhoneCI(raw: string): string | null {
  if (!raw) return null;

  // On retire espaces, points, tirets et parenthèses éventuels.
  const cleaned = raw.replace(/[\s.\-()]/g, "");

  // Groupe capturé = les 10 chiffres locaux commençant par 0.
  const match = cleaned.match(/^(?:\+?225)?(0\d{9})$/);
  if (!match) return null;

  return `+225${match[1]}`;
}

/** Prédicat de validation pour Zod : `true` si le numéro CI est valide. */
export function isValidPhoneCI(raw: string): boolean {
  return normalizePhoneCI(raw) !== null;
}
