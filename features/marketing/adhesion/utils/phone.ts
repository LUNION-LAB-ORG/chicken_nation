/**
 * Utilitaires de gestion des numéros de téléphone — INTERNATIONAL, défaut CI.
 *
 * Décision 30/07 : plus AUCUNE contrainte de pays — tout numéro peut adhérer.
 * Règles de normalisation (avec ou sans espaces / points / tirets) :
 *   - 10 chiffres commençant par 0 → numéro LOCAL ivoirien → `+225XXXXXXXXXX`
 *     (la numérotation CI 2021 : 07/05/01 + 8 chiffres) ;
 *   - `00` initial → remplacé par `+` (graphie internationale historique) ;
 *   - tout autre numéro de 8 à 15 chiffres → `+<chiffres>` tel que saisi
 *     (ex. +221 77 123 45 67 — l'indicatif pays doit être fourni).
 * Forme canonique : E.164 `+<indicatif><numéro>` — la même que le backend.
 */

/** Retourne le numéro normalisé (`+…`, E.164) ou `null` si invalide. */
export function normalizePhoneCI(raw: string): string | null {
  if (!raw) return null;

  // On retire espaces, points, tirets et parenthèses éventuels.
  let cleaned = raw.replace(/[\s.\-()]/g, "");
  // `00` international → `+`.
  if (cleaned.startsWith("00")) cleaned = `+${cleaned.slice(2)}`;
  const digits = cleaned.replace(/\D/g, "");

  if (!/^\d{8,15}$/.test(digits)) return null;

  // Saisie LOCALE ivoirienne (10 chiffres commençant par 0) → +225.
  if (/^0\d{9}$/.test(digits)) return `+225${digits}`;

  return `+${digits}`;
}

/** Prédicat de validation pour Zod : `true` si le numéro est exploitable. */
export function isValidPhoneCI(raw: string): boolean {
  return normalizePhoneCI(raw) !== null;
}
