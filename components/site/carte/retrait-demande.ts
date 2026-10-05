/**
 * « Retirer ici » choisi sur un restaurant alors que le panier était vide :
 * le visiteur arrive sur `/fr/carte?retrait=<slug>`, choisit ses plats, puis
 * passe à la caisse par la barre du panier (sans paramètre). Le choix est
 * gardé le temps de l'onglet pour que la caisse le reprenne.
 *
 * La caisse (lot L11c) lit d'abord `?retrait=` sur `/fr/commander`, sinon
 * `lireRetraitDemande()`, puis appelle `oublierRetraitDemande()` une fois le
 * mode retrait appliqué.
 *
 * Navigation privée ou stockage bloqué : chaque accès peut lever une
 * exception, d'où les try/catch. On perd alors ce confort, rien de plus.
 */

const CLE = "cn-retrait-demande";

// Un choix plus ancien est ignoré : le visiteur a pu changer d'avis.
const DUREE_MS = 2 * 60 * 60 * 1000;

/** Slug de restaurant tel qu'il apparaît dans les adresses (`sococe-2-plateaux`). */
export const slugValide = (slug: string | null | undefined): slug is string =>
  typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export function memoriserRetraitDemande(slug: string, maintenant = Date.now()) {
  if (!slugValide(slug)) return;
  try {
    window.sessionStorage.setItem(
      CLE,
      JSON.stringify({ slug, le: maintenant }),
    );
  } catch {
    /* stockage indisponible */
  }
}

/** Slug du restaurant choisi sur la carte, ou `null`. */
export function lireRetraitDemande(maintenant = Date.now()): string | null {
  try {
    const brut = JSON.parse(window.sessionStorage.getItem(CLE) ?? "null") as {
      slug?: unknown;
      le?: unknown;
    } | null;

    if (
      !brut ||
      typeof brut.slug !== "string" ||
      !slugValide(brut.slug) ||
      typeof brut.le !== "number" ||
      maintenant - brut.le > DUREE_MS
    )
      return null;

    return brut.slug;
  } catch {
    return null;
  }
}

export function oublierRetraitDemande() {
  try {
    window.sessionStorage.removeItem(CLE);
  } catch {
    /* stockage indisponible */
  }
}
