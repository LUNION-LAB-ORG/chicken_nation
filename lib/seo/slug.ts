/**
 * Partie d'adresse lisible tirée d'un nom de la base : minuscules, sans
 * accents, mots séparés par un trait d'union.
 *
 * « MÉCHANT MÉCHANT » → « mechant-mechant », « NUGGETS (12 PCS) » →
 * « nuggets-12-pcs », « FRITE ET CODY'S » → « frite-et-codys ».
 * Renvoie une chaîne vide si le nom ne contient ni lettre ni chiffre.
 */
export function slugifier(texte: string): string {
  return (
    String(texte ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      // L'apostrophe ne coupe pas le mot : « cody's » et non « cody-s ».
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}
