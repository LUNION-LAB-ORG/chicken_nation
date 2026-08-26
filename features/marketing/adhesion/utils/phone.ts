/**
 * Numéros de téléphone — INTERNATIONAL, défaut Côte d'Ivoire.
 *
 * Forme canonique : E.164 `+<indicatif><numéro>`, la même que le backend.
 *
 * ⚠️ La numérotation ivoirienne depuis 2021 tient en dix chiffres, et le
 * premier n'est PAS un préfixe interurbain qu'on laisse tomber : il fait partie
 * du numéro. `+225 07 07 07 07 07` s'écrit donc avec son zéro.
 *   - mobiles : 01, 05, 07 (commencent par 0) ;
 *   - fixes   : 21, 25, 27 (commencent par 2).
 *
 * L'ancienne règle ne reconnaissait comme ivoirien que « dix chiffres
 * commençant par 0 ». Deux conséquences, silencieuses toutes les deux :
 *   - un fixe `27 21 23 45 67` ne recevait pas `+225` et devenait `+2721234567`,
 *     lu comme un numéro sud-africain (+27) ;
 *   - un ancien numéro à huit chiffres passait la validation et devenait
 *     `+07070707`, or aucun indicatif pays ne commence par 0 : ce numéro ne
 *     peut RIEN recevoir, ni WhatsApp ni SMS, et la connexion dans
 *     l'application ne le retrouvera jamais.
 * Mieux vaut refuser à la saisie que d'enregistrer un numéro injoignable.
 */

const INDICATIF_CI = '225';

/** Dix chiffres ivoiriens : mobile (0…) ou fixe (2…). */
function estNumeroLocalCI(digits: string): boolean {
  return /^[02]\d{9}$/.test(digits);
}

/**
 * Numéro normalisé en E.164, ou `null` si on ne peut pas le rendre joignable.
 *
 * Refuse explicitement, au lieu de fabriquer un numéro faux :
 *   - les huit chiffres de l'ancienne numérotation ivoirienne ;
 *   - `+225` suivi de neuf chiffres (le premier chiffre a été oublié, et on ne
 *     peut pas deviner s'il s'agissait de 01, 05 ou 07) ;
 *   - tout ce qui commencerait par `+0`.
 */
export function normalizePhoneCI(raw: string): string | null {
  if (!raw) return null;

  // Espaces, points, tirets et parenthèses éventuels.
  let cleaned = raw.replace(/[\s.\-()]/g, '');
  // `00` international → `+`.
  if (cleaned.startsWith('00')) cleaned = `+${cleaned.slice(2)}`;
  const digits = cleaned.replace(/\D/g, '');

  if (!/^\d{8,15}$/.test(digits)) return null;

  // Indicatif ivoirien fourni, avec ou sans `+`.
  if (digits.startsWith(INDICATIF_CI)) {
    const local = digits.slice(INDICATIF_CI.length);
    return estNumeroLocalCI(local) ? `+${INDICATIF_CI}${local}` : null;
  }

  // Saisie locale ivoirienne, sans indicatif.
  if (estNumeroLocalCI(digits)) return `+${INDICATIF_CI}${digits}`;

  // Numéro étranger : l'indicatif fait partie de la saisie. Un indicatif ne
  // commence jamais par 0, donc `+0…` est forcément une saisie locale
  // incomplète et non un numéro international.
  if (digits.startsWith('0')) return null;
  // Neuf chiffres ou moins sans indicatif reconnaissable : trop court pour être
  // un numéro international complet.
  if (digits.length < 10) return null;

  return `+${digits}`;
}

/** Prédicat de validation pour Zod : `true` si le numéro est joignable. */
export function isValidPhoneCI(raw: string): boolean {
  return normalizePhoneCI(raw) !== null;
}
