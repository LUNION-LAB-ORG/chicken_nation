import { MetadataRoute } from "next";

const SITE_URL = "https://www.chicken-nation.com";

// Le contenu est en français sur toutes les langues : seules les adresses
// /fr sont déclarées (ce sont les adresses de référence des pages).
const pages: { chemin: string; priorite: number; frequence: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { chemin: "", priorite: 1, frequence: "weekly" },
    { chemin: "/restaurants/nos-menus", priorite: 0.9, frequence: "weekly" },
    { chemin: "/restaurants", priorite: 0.9, frequence: "monthly" },
    { chemin: "/app-mobile", priorite: 0.8, frequence: "monthly" },
    { chemin: "/carte-nation/adhesion", priorite: 0.8, frequence: "monthly" },
    { chemin: "/franchise", priorite: 0.7, frequence: "monthly" },
    { chemin: "/histoire", priorite: 0.6, frequence: "yearly" },
    { chemin: "/faq", priorite: 0.6, frequence: "monthly" },
    { chemin: "/contact", priorite: 0.6, frequence: "yearly" },
    { chemin: "/politique", priorite: 0.2, frequence: "yearly" },
    { chemin: "/privacy-rules", priorite: 0.2, frequence: "yearly" },
    { chemin: "/deletion-of-account", priorite: 0.2, frequence: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
    return pages.map(({ chemin, priorite, frequence }) => ({
        url: `${SITE_URL}/fr${chemin}`,
        changeFrequency: frequence,
        priority: priorite,
    }));
}
