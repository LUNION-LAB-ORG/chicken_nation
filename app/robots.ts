import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/api/", "/*/dashboard", "/*/auth/", "/*/app-mobile/deep-link", "/*/app-mobile/download", "/*/commander"],
        },
        sitemap: "https://www.chicken-nation.com/sitemap.xml",
    };
}
