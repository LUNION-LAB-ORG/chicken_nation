import type { MetadataRoute } from "next";

import { COULEUR_THEME } from "./[locale]/meta";

import { liensStores } from "@/config/site";
import { INSECABLE } from "@/lib/typo";

/**
 * Manifeste du site (/manifest.webmanifest, lié par Next dans chaque page).
 * Remplace l'ancien app/manifest.json, nommé « App », dont les icônes
 * répondaient 404 : elles sont servies depuis app/ (icon.png, apple-icon.png)
 * et public/seo/.
 *
 * Le site n'est pas une application installable : Chrome propose plutôt
 * l'application des stores (`prefer_related_applications`).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/fr",
    name: "CHICKEN NATION",
    short_name: "Chicken Nation",
    description: `Poulet 100${INSECABLE}% local et halal, burgers et box à Abidjan. Commandez en ligne, en livraison ou à retirer au restaurant.`,
    lang: "fr",
    dir: "ltr",
    start_url: "/fr",
    scope: "/",
    display: "standalone",
    theme_color: COULEUR_THEME,
    background_color: "#FFFCF7",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/seo/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/seo/android-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/seo/android-icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/seo/android-icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
    ],
    related_applications: [
      {
        platform: "play",
        url: liensStores.android,
        id: "com.chickennation.app",
      },
      { platform: "itunes", url: liensStores.ios },
    ],
    prefer_related_applications: true,
  };
}
