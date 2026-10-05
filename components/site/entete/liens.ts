/**
 * Adresses du gabarit commun (en-tête, menu du téléphone, pied de page, barre
 * du panier) et règles d'affichage qui dépendent de la page en cours.
 */

export const CHEMIN_ACCUEIL = "/fr";
export const CHEMIN_CARTE = "/fr/carte";
export const CHEMIN_CAISSE = "/fr/commander";
export const CHEMIN_MES_COMMANDES = "/fr/commander/mes-commandes";

export interface ILienSite {
  href: string;
  libelle: string;
}

/**
 * Navigation de l'en-tête, dès 960 px (retouche 12). Entre 960 et 1 099 px,
 * cinq liens ne tiennent pas à côté de la marque, de « Commander » et du
 * panier : « Histoire » n'apparaît qu'à partir de 1 100 px (risque R11 du
 * plan) et reste dans le pied de page.
 */
export const LIENS_NAVIGATION: readonly (ILienSite & { des1100?: true })[] = [
  { href: CHEMIN_CARTE, libelle: "Carte" },
  { href: "/fr/restaurants", libelle: "Restaurants" },
  { href: "/fr#avantages", libelle: "Avantages" },
  { href: "/fr/histoire", libelle: "Histoire", des1100: true },
  { href: CHEMIN_MES_COMMANDES, libelle: "Mes commandes" },
];

/** Menu du téléphone : la navigation, plus la Carte de la Nation, l'application et la franchise. */
export const LIENS_MENU_MOBILE: readonly ILienSite[] = [
  { href: CHEMIN_CARTE, libelle: "La carte" },
  { href: CHEMIN_MES_COMMANDES, libelle: "Mes commandes" },
  { href: "/fr/restaurants", libelle: "Restaurants" },
  { href: "/fr#avantages", libelle: "Avantages" },
  { href: "/fr/carte-nation/adhesion", libelle: "Carte de la Nation" },
  { href: "/fr/app-mobile", libelle: "Application" },
  { href: "/fr/histoire", libelle: "Notre histoire" },
  { href: "/fr/histoire#franchise", libelle: "Devenir franchisé" },
];

/** Liens du pied de page (plan, section 3.1). */
export const LIENS_PIED: readonly ILienSite[] = [
  { href: CHEMIN_CARTE, libelle: "La carte" },
  { href: CHEMIN_MES_COMMANDES, libelle: "Mes commandes" },
  { href: "/fr/restaurants", libelle: "Restaurants" },
  { href: "/fr#avantages", libelle: "Vos avantages" },
  { href: "/fr/carte-nation/adhesion", libelle: "Carte de la Nation" },
  { href: "/fr/app-mobile", libelle: "Application" },
  { href: "/fr/histoire", libelle: "Notre histoire" },
  { href: "/fr/histoire#franchise", libelle: "Devenir franchisé" },
  { href: "/fr/contact", libelle: "Contact" },
  { href: "/fr/faq", libelle: "FAQ" },
  { href: "/fr/politique", libelle: "Politique de confidentialité" },
  // Demandé par Google Play pour la fiche de l'application.
  { href: "/fr/deletion-of-account", libelle: "Supprimer mon compte" },
];

/** Chemin sans barre finale ni ancre (« /fr/carte/ » → « /fr/carte »). */
export const cheminPropre = (chemin: string | null | undefined) =>
  (chemin ?? "").split(/[?#]/)[0].replace(/(.)\/+$/, "$1");

/**
 * État d'un lien de navigation sur la page en cours : « page » pour la page
 * elle-même, « true » dans sa rubrique (page d'un plat sous la carte),
 * `undefined` ailleurs. Un lien vers une ancre de l'accueil n'est jamais marqué.
 */
export function lienCourant(
  href: string,
  chemin: string | null | undefined,
): "page" | "true" | undefined {
  if (href.includes("#")) return undefined;
  const cible = cheminPropre(href);
  const ici = cheminPropre(chemin);

  if (ici === cible) return "page";
  if (cible !== CHEMIN_ACCUEIL && ici.startsWith(`${cible}/`)) return "true";

  return undefined;
}

/** Bouton « Commander » de l'en-tête masqué sur la carte et sur la caisse (maquette, JS 747). */
export const sansBoutonCommander = (chemin: string | null | undefined) => {
  const ici = cheminPropre(chemin);

  return ici === CHEMIN_CARTE || ici === CHEMIN_CAISSE;
};

/**
 * Barre du panier masquée sur la caisse et sur le suivi d'une commande
 * (`/fr/commander/<id>`), mais pas sur « Mes commandes ».
 */
export function sansBarrePanier(chemin: string | null | undefined) {
  const ici = cheminPropre(chemin);

  if (ici === CHEMIN_CAISSE) return true;
  if (ici.startsWith(`${CHEMIN_CAISSE}/`)) return ici !== CHEMIN_MES_COMMANDES;

  // Provisoire : l'ancienne carte a encore sa propre barre (lot L7 la remplace).
  return ici === "/fr/restaurants/nos-menus";
}
