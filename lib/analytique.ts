/**
 * Mesure d'audience Google Analytics 4, sans gêner le premier affichage.
 *
 * Le script de Google (environ 150 ko) n'est demandé qu'une fois la page
 * chargée et le navigateur au repos, comme `next/script` en `lazyOnload`.
 * Le chargeur est un petit script écrit dans le HTML (SCRIPT_GA, posé par
 * `app/[locale]/layout.tsx`) : aucun JavaScript de plus dans les paquets du
 * site, et `gtag` existe dès le départ. Les événements envoyés avant l'arrivée
 * du script attendent dans `dataLayer`.
 *
 * Les pages vues des changements de page sans rechargement sont comptées par
 * GA4 lui-même (mesure améliorée, historique du navigateur). Sur un poste de
 * développement (localhost), le script de Google n'est jamais chargé.
 */

export const ID_GA = "G-W7K9L1RZ8E";

const ADRESSE_GTAG = `https://www.googletagmanager.com/gtag/js?id=${ID_GA}`;

export const SCRIPT_GA = [
  "window.dataLayer=window.dataLayer||[];",
  "function gtag(){dataLayer.push(arguments)}",
  "gtag('js',new Date());",
  `gtag('config','${ID_GA}');`,
  "(function(){",
  // Poste de développement : les événements restent dans dataLayer (lisibles
  // pour les essais) mais rien n'est envoyé à Google.
  "if(/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname))return;",
  "function charger(){var s=document.createElement('script');",
  `s.async=true;s.src='${ADRESSE_GTAG}';document.head.appendChild(s)}`,
  "function auRepos(){if('requestIdleCallback' in window)window.requestIdleCallback(charger,{timeout:5000});else setTimeout(charger,1)}",
  "if(document.readyState==='complete')auRepos();",
  "else window.addEventListener('load',auRepos,{once:true})",
  "})();",
].join("");

type Gtag = (commande: "event", nom: string, parametres: object) => void;

/** Envoie un événement GA4 ; sans effet si le chargeur est absent (tests, bloqueur). */
export function evenementGA(nom: string, parametres: object = {}) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;

  if (typeof gtag !== "function") return;
  try {
    gtag("event", nom, parametres);
  } catch {
    /* la mesure ne doit jamais casser la page */
  }
}

/** Article au format du commerce GA4 (prix en francs CFA, entiers). */
export interface IArticleGA {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
}

/**
 * Événement de commerce GA4 (`view_item`, `add_to_cart`, `begin_checkout`,
 * `purchase`) : devise XOF, valeur égale à la somme des articles sauf montant
 * donné (total payé pour un achat).
 */
export function evenementCommerce(
  nom: "view_item" | "add_to_cart" | "begin_checkout" | "purchase",
  articles: IArticleGA[],
  extra: { value?: number; transaction_id?: string } = {},
) {
  const value =
    extra.value ??
    articles.reduce((total, a) => total + a.price * a.quantity, 0);

  evenementGA(nom, { currency: "XOF", ...extra, value, items: articles });
}
