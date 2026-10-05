/**
 * Mise en forme des textes et des montants, reprise de la maquette (JS 6-47).
 * Sert au rendu serveur comme au navigateur : aucune dépendance.
 */

/** Espace insécable : jamais de retour à la ligne entre un nombre et son unité. */
export const INSECABLE = " ";

/** 12500 → « 12 500 » (insécables entre les milliers). */
export const nombre = (n: number) =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, INSECABLE);

/** 12500 → « 12 500 FCFA ». */
export const fcfa = (montant: number) => `${nombre(montant)}${INSECABLE}FCFA`;

/** 3 → « 3 plats », 1 → « 1 plat ». */
export const pluriel = (n: number, un: string, plusieurs: string) =>
  `${nombre(n)}${INSECABLE}${n > 1 ? plusieurs : un}`;

/** 2.4 → « 2,4 km ». */
export const kmTexte = (km: number | string) =>
  `${String(km).replace(".", ",")}${INSECABLE}km`;

/**
 * Typographie française pour les textes venus de l'API : insécable avant
 * « : ? ! ; » et « », après « », entre les milliers, avant % et FCFA.
 * Ne touche qu'aux espaces déjà là : un texte correct ressort inchangé.
 */
export const typo = (texte: string) =>
  String(texte)
    .replace(/ ([:?!;»])/g, `${INSECABLE}$1`)
    .replace(/« /g, `«${INSECABLE}`)
    .replace(/(\d) (?=\d{3}(?!\d))/g, `$1${INSECABLE}`)
    .replace(/(\d) (%|FCFA)/g, `$1${INSECABLE}$2`);

/** Mots gardés tels quels par joli() (sigles, tailles). */
const GARDES: Record<string, string> = {
  bbq: "BBQ",
  xl: "XL",
  m: "M",
  up: "Up",
  pcs: "pcs",
};

/**
 * Noms en capitales de la base : « HOT CREAMY BBQ » devient « Hot creamy BBQ »,
 * « COCA 0,5L » devient « Coca 0,5 l ».
 */
export function joli(nom: string | null | undefined) {
  let r = String(nom ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("fr");

  r = r
    .replace(/[a-zà-ÿ]+/gi, (mot) => GARDES[mot] ?? mot)
    .replace(/(\d),(\d)l\b/g, `$1,$2${INSECABLE}l`);

  return r.charAt(0).toUpperCase() + r.slice(1);
}

/**
 * Mots courants remis en minuscules par phrase(). Liste de la maquette,
 * complétée de quelques mots outils (avec, sans, en, sur, pour, aux, la, le, les).
 */
const COURANTS = new Set(
  (
    "de d du des ou non et a au aux un une l la le les avec sans en sur pour " +
    "morceaux morceau poulet pane pané épicé epicé épice frite frites salade " +
    "tomate cornichon cornichons mayonnaise cheddar steak viande pain tortilla " +
    "lamelle lamelles ailes nuggets fromage emmental crème ail boisson filet " +
    "blanc sauce choix tender tenders crispy quatre coleslaw ketchup arabe mariné curry"
  ).split(" "),
);

const LETTRES = "A-Za-zÀ-ÖØ-öø-ÿ";

/**
 * Descriptions souvent écrites « Une Majuscule À Chaque Mot » : les mots
 * courants repassent en minuscules. Le premier mot et les noms propres de la
 * marque (devant « Patron » ou « Nation ») gardent leur majuscule. Une
 * description déjà écrite normalement ressort inchangée.
 */
export function phrase(description: string | null | undefined) {
  const s = String(description ?? "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
  const mots = s.match(new RegExp(`[${LETTRES}]{2,}`, "g")) ?? [];
  const majuscules = mots.filter((m) => /^[A-ZÀ-ÖØ-Þ]/.test(m)).length;

  if (mots.length < 3 || majuscules / mots.length < 0.5) return s;

  return s.replace(
    new RegExp(`[${LETTRES}]+`, "g"),
    (mot, position: number) => {
      if (position === 0) return mot;
      if (/^(Patron|Nation)\b/.test(s.slice(position + mot.length).trim()))
        return mot;

      return COURANTS.has(mot.toLowerCase()) ? mot.toLowerCase() : mot;
    },
  );
}

/** Seul numéro affiché et publié (retouche 6). */
export const TELEPHONE = "27 21 71 21 30";

/** « 27 21 71 21 30 » ou « +225 27… » → « tel:+2252721712130 ». */
export function telLien(numero: string = TELEPHONE) {
  const chiffres = numero.replace(/\D/g, "");
  const national =
    chiffres.length > 10 && chiffres.startsWith("225")
      ? chiffres.slice(3)
      : chiffres;

  return `tel:+225${national}`;
}

/**
 * Textes permis en police d'affiche (Balbeer Rustic) : lettres sans accent,
 * chiffres, espace, virgule, point. La police n'a ni É ni À.
 */
export const estTexteAffiche = (texte: string) =>
  /^[A-Za-z0-9 ,.]+$/.test(texte);
