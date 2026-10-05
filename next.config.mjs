import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
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

// Liens universels de l'appli iOS (public/.well-known/apple-app-site-association
// et sa copie à la racine) : fichier sans extension, que Next servirait en
// application/octet-stream ; Apple attend du JSON. Exclus de proxy.ts : aucune
// redirection vers /fr.
const enTetesLiensAppli = [{ key: "Content-Type", value: "application/json" }];

// Fichiers statiques de public/ (images, vidéo, badges des stores) gardés 30
// jours par le navigateur, puis encore un jour pendant leur revérification.
// Règle : un fichier modifié change de nom (ou de paramètre ?v=, voir le sprite
// des icônes plus bas). Les images optimisées (/_next/image) suivent déjà
// `images.minimumCacheTTL` ; /_next/static est géré par Next (un an).
const enTetesCacheLong = [
  { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
];

// La carte /fr/carte remplace /fr/restaurants/nos-menus. Tant que sa page
// n'existe pas, l'ancienne carte reste servie : la rediriger vers une 404
// couperait la commande en ligne. Lu à la construction (et au démarrage du
// serveur de développement, à relancer après la création de la page).
const racine = path.dirname(fileURLToPath(import.meta.url));
const carteLivree = existsSync(path.join(racine, "app", "[locale]", "(public)", "carte", "page.tsx"));

// Empreinte du sprite des icônes (components/site/Icone.tsx) : son adresse
// change avec son contenu, malgré le cache long des fichiers statiques.
const versionIcones = createHash("sha256")
  .update(readFileSync(path.join(racine, "public", "assets", "site", "icones.svg")))
  .digest("hex")
  .slice(0, 10);

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
  // Écrit dans le code à la construction (serveur et navigateur).
  env: { VERSION_ICONES: versionIcones },
  async headers() {
    return [
      { source: "/:path*", headers: enTetesSecurite },
      { source: "/assets/:chemin*", headers: enTetesCacheLong },
      { source: "/:badge(download-[^/]+)", headers: enTetesCacheLong },
      { source: "/.well-known/apple-app-site-association", headers: enTetesLiensAppli },
      { source: "/apple-app-site-association", headers: enTetesLiensAppli },
    ];
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
