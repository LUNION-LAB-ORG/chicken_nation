import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// En-têtes de sécurité envoyés avec chaque réponse. Pas de CSP complète :
// Google Analytics et les scripts en ligne de Next la rendraient fragile.
const enTetesSecurite = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Géolocalisation permise au site lui-même : « Utiliser ma position » à la commande.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
];

// La carte /fr/carte remplace /fr/restaurants/nos-menus. Tant que sa page
// n'existe pas, l'ancienne carte reste servie : la rediriger vers une 404
// couperait la commande en ligne. Lu à la construction (et au démarrage du
// serveur de développement, à relancer après la création de la page).
const carteLivree = existsSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "app", "[locale]", "(public)", "carte", "page.tsx"),
);

/**
 * Redirections permanentes (308), traitées avant proxy.ts. Les anciennes
 * adresses gardent ainsi leur poids dans Google. La première règle qui
 * correspond s'applique : les plus précises d'abord, pour éviter les chaînes.
 * Le tableau de bord, la connexion du personnel et l'inscription supprimés ne
 * sont pas redirigés : ils répondent une vraie 404.
 */
const redirections = [
  // Histoire et Franchise fusionnées en une page (décision du 03/10).
  { source: "/:langue(fr|en|ar)?/franchise", destination: "/fr/histoire#franchise", permanent: true },
  // Carte de la Nation : la seule page est l'adhésion.
  { source: "/:langue(fr|en|ar)?/carte-nation", destination: "/fr/carte-nation/adhesion", permanent: true },
  ...(carteLivree
    ? [{ source: "/:langue(fr|en|ar)?/restaurants/nos-menus", destination: "/fr/carte", permanent: true }]
    : []),
  // Français seulement : les adresses anglaises et arabes mènent à la page française.
  { source: "/:langue(en|ar)", destination: "/fr", permanent: true },
  { source: "/:langue(en|ar)/:chemin*", destination: "/fr/:chemin*", permanent: true },
];

const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: enTetesSecurite }];
  },
  async redirects() {
    return redirections;
  },
  experimental: {
    // 404 entière dès le serveur pour les adresses inconnues (app/global-not-found.tsx).
    globalNotFound: true,
  },
  images: {
    // AVIF puis WebP selon ce que le navigateur accepte.
    formats: ["image/avif", "image/webp"],
    // Largeurs proposées au navigateur : téléphones courants (360, 414) en tête.
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
    // Next 16 refuse toute qualité non déclarée ici (75 est la valeur par défaut).
    qualities: [60, 75],
    // Images optimisées gardées 30 jours : un fichier modifié change de nom.
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chicken.turbodeliveryapp.com",
      },
      {
        protocol: "https",
        hostname: "api-private.chicken-nation.com",
      },
      {
        protocol: "https",
        hostname: "dvsxt5681pvqm.cloudfront.net",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
