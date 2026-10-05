import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo/commun";

/**
 * Pages exclues de l'exploration : l'API, la caisse et le suivi (propres à
 * chaque client), et les pages de passage vers l'appli (QR codes, liens
 * partagés). Ni les images optimisées (`/_next/image`) ni les images de
 * partage ne sont bloquées : Google et WhatsApp doivent pouvoir les lire.
 * Une page à garder hors de l'index mais explorable (accord de
 * confidentialité, 404) porte `noindex` au lieu d'une ligne ici.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/*/commander",
        "/*/app-mobile/deep-link",
        "/*/app-mobile/download",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
