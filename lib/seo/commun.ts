/**
 * Repères communs aux données structurées (JSON-LD) du site : adresse
 * publique, identifiants `@id` stables du graphe et seul numéro publié.
 */

/** Origine publique : les adresses du JSON-LD ne dépendent jamais du serveur qui rend la page. */
export const SITE_URL = "https://www.chicken-nation.com";

/** Nœud `Organization` publié par la mise en page publique. */
export const ID_ORGANISATION = `${SITE_URL}/#organization`;

/** Nœud `Menu` publié sur la carte, repris par le `hasMenu` des restaurants. */
export const CHEMIN_CARTE = "/fr/carte";
export const ID_MENU = `${SITE_URL}${CHEMIN_CARTE}#menu`;

/**
 * Seul numéro publié (retouche 6) : jamais celui d'un restaurant, ni à
 * l'écran, ni dans le JSON-LD.
 */
export const TELEPHONE_SCHEMA = "+225 27 21 71 21 30";

/** « /fr/carte » → « https://www.chicken-nation.com/fr/carte » ; une adresse complète reste telle quelle. */
export function adresseAbsolue(chemin: string): string {
  if (/^https?:\/\//.test(chemin)) return chemin;

  return `${SITE_URL}${chemin.startsWith("/") ? "" : "/"}${chemin}`;
}

/**
 * Texte d'un `<script type="application/ld+json">`. Les noms et descriptions
 * viennent du backoffice : « < » est échappé pour qu'aucune donnée ne puisse
 * fermer la balise script. Le résultat reste lisible par `JSON.parse`.
 */
export function jsonLd(donnees: unknown): string {
  return JSON.stringify(donnees).replace(/</g, "\\u003c");
}
