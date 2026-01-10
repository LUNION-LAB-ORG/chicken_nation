import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost:3000",
      },
      {
        protocol: "https",
        hostname: "chicken.turbodeliveryapp.com",
      },
      {
        protocol: "https",
        hostname: "dvsxt5681pvqm.cloudfront.net",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
