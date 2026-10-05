export type SiteConfig = typeof siteConfig;

/**
 * Langues servies : le français seulement. Les anciennes adresses /en et /ar
 * sont redirigées vers /fr par next.config.mjs.
 * Pour rouvrir l'anglais : remettre "en" ici avec de vraies traductions, retirer
 * la redirection et réactiver `alternateLinks` dans i18n/routing.ts.
 */
export const locales = ["fr"] as const;

export const siteConfig = {
  name: "Chicken Nation",
  description:
    "Née de la passion pour le poulet de qualité, Chicken Nation s'est établie comme une référence en matière de restauration rapide en Côte d'Ivoire.",
};

/**
 * Fiches de l'application dans les stores. Écrites ici et non lues dans
 * l'environnement : les variables NEXT_PUBLIC_* ne sont pas transmises à la
 * construction par le Dockerfile, elles seraient vides en production.
 */
export const liensStores = {
  android:
    "https://play.google.com/store/apps/details?id=com.chickennation.app",
  ios: "https://apps.apple.com/ci/app/chicken-nation/id6745905607",
} as const;
