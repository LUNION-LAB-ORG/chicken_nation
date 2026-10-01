import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// En-têtes de sécurité envoyés avec chaque réponse. Pas de CSP complète :
// Google Analytics et les scripts en ligne de Next la rendraient fragile.
const enTetesSecurite = [
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'" },
];

const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: enTetesSecurite }];
  },
  images: {
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
