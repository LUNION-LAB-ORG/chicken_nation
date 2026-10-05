/**
 * Lecture des paramètres de la page de repli `/app-mobile/deep-link`.
 *
 * Deux familles de liens y arrivent :
 * - ceux du backoffice : `?product=ID`, `?category=ID`, `?order=ID`,
 *   `?voucher=true`, `?loyalty=true`, `?nation-card=true` ;
 * - ceux envoyés aux clients : `?to=nation-card` (WhatsApp « carte prête »)
 *   et `?ref=CODE` (lien d'invitation du parrainage).
 *
 * Tout vient de l'URL, donc de n'importe qui : `to` passe par une liste
 * blanche et `ref` par un contrôle de forme avant d'entrer dans le lien de
 * l'appli.
 */

/** Ce qu'il faut au lien de l'appli (`chemin`) et au suivi des clics. */
export interface CibleFixe {
  genre: "fixe";
  /** Chemin compris par le DeepLinkManager de l'appli : `nation-card`, `order/ID`... */
  chemin: string;
  /** Type de clic enregistré (mêmes valeurs que le backoffice). */
  type: string;
  idSuivi?: string;
  libelle: string;
  /** Nom affiché sur la page ; vide pour l'accueil. */
  nom: string;
}

/** Plat et catégorie : le nom et l'identifiant se résolvent par l'API. */
export type CibleDeepLink =
  | { genre: "categorie"; id: string }
  | { genre: "plat"; id: string }
  | CibleFixe;

const ACCUEIL: CibleFixe = {
  genre: "fixe",
  chemin: "home",
  type: "home",
  libelle: "Accueil",
  nom: "",
};
const BONS: CibleFixe = {
  genre: "fixe",
  chemin: "vouchers",
  type: "voucher",
  libelle: "Bons et Codes Promo",
  nom: "Bons et Codes Promo",
};
const FIDELITE: CibleFixe = {
  genre: "fixe",
  chemin: "loyalty",
  type: "loyalty",
  libelle: "Club de Fidélité",
  nom: "Club de Fidélité",
};
const CARTE_NATION: CibleFixe = {
  genre: "fixe",
  chemin: "nation-card",
  type: "nation_card",
  libelle: "Carte de la Nation",
  nom: "Carte de la Nation",
};

/**
 * Valeurs admises pour `?to=`, sous les noms des gestionnaires de l'appli
 * (app/src/config/deeplink-config/handlers/index.ts). Seulement les écrans
 * sans identifiant : un plat, une catégorie ou une commande passent par leur
 * propre paramètre.
 */
const CIBLES_TO: Record<string, CibleFixe> = {
  home: ACCUEIL,
  vouchers: BONS,
  loyalty: FIDELITE,
  "nation-card": CARTE_NATION,
};

/**
 * Code de parrainage tel que le serveur l'attend (il le met lui aussi en
 * majuscules), ou null s'il n'a pas une forme plausible.
 *
 * Les codes produits par le serveur font 8 caractères (`CN` + 6). Un code que
 * `Number()` sait lire est écarté : l'appli convertit ces valeurs en nombre
 * en lisant le lien et perdrait le code (« 0X1F » deviendrait 31).
 */
export function lireCodeParrainage(brut: string | null): string | null {
  const code = (brut ?? "").trim().toUpperCase();

  if (!/^[A-Z0-9]{4,20}$/.test(code)) return null;
  if (!isNaN(Number(code))) return null;

  return code;
}

const ID_COMMANDE = /^[A-Za-z0-9_-]{1,64}$/;

/** Écran visé par le lien ; l'accueil si rien d'exploitable. */
export function lireCibleDeepLink(params: {
  get(nom: string): string | null;
}): CibleDeepLink {
  const category = params.get("category");
  const product = params.get("product");
  const order = params.get("order");

  if (category) return { genre: "categorie", id: category };
  if (product) return { genre: "plat", id: product };
  if (order) {
    // Lettres, chiffres et tirets seulement (UUID, référence), sinon accueil :
    // l'identifiant finit dans l'adresse de l'API côté appli (orders/ID/client),
    // qui ne l'encode pas.
    if (!ID_COMMANDE.test(order)) return ACCUEIL;

    return {
      genre: "fixe",
      chemin: `order/${order}`,
      type: "order",
      idSuivi: order,
      libelle: `Commande ${order}`,
      nom: `Commande ${order}`,
    };
  }
  if (params.get("voucher")) return BONS;
  if (params.get("loyalty")) return FIDELITE;
  if (params.get("nation-card")) return CARTE_NATION;

  const to = (params.get("to") ?? "").trim().toLowerCase();

  // hasOwnProperty : « constructor » ou « __proto__ » ne sont pas des cibles.
  if (Object.prototype.hasOwnProperty.call(CIBLES_TO, to)) return CIBLES_TO[to];

  return ACCUEIL;
}

/**
 * Lien qui ouvre l'appli : `chickennation://nation-card?ref=CN7KQ2PX`.
 * L'appli lit le chemin pour l'écran et `ref` pour pré-remplir le code à
 * l'inscription (DeepLinkManager.handle).
 */
export function lienAppli(
  schema: string,
  chemin: string,
  codeParrainage: string | null,
): string {
  const lien = `${schema}://${chemin}`;

  return codeParrainage
    ? `${lien}?ref=${encodeURIComponent(codeParrainage)}`
    : lien;
}

/** Libellé du clic : le code de parrainage s'y ajoute pour le retrouver au backoffice. */
export function libelleSuivi(
  libelle: string,
  codeParrainage: string | null,
): string {
  return codeParrainage ? `${libelle} (parrainage ${codeParrainage})` : libelle;
}
