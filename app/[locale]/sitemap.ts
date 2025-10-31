import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://www.chicken-nation.com",
            lastModified: new Date(),
        },
    ];
}
