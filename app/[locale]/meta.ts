import type { Metadata, Viewport } from "next";

const SITE_URL = "https://www.chicken-nation.com";

const IMAGE_PARTAGE = {
    url: "/assets/images/partage/chicken-nation.jpg",
    width: 1200,
    height: 630,
    alt: "CHICKEN NATION, délicieux jusqu'à l'os",
};

const TITRE_ACCUEIL = "CHICKEN NATION - Le Meilleur du Poulet à Abidjan, Côte d'Ivoire";
const DESCRIPTION_ACCUEIL = "CHICKEN NATION, la référence du fast-food à Abidjan. Poulet 100% local élevé dans nos fermes. Croustillant, grillé ou épicé. Livraison en 20 à 35 min. Restaurants à Zone 4, Angré, Sococé, Faya et Yopougon.";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: TITRE_ACCUEIL,
        template: "%s | CHICKEN NATION",
    },
    description: DESCRIPTION_ACCUEIL,
    referrer: "origin-when-cross-origin",
    keywords: [
        "Chicken Nation Abidjan",
        "Fast food Côte d'Ivoire",
        "Poulet croustillant Abidjan",
        "Burger poulet Abidjan",
        "Restaurant Zone 4 Abidjan",
        "Restaurant Angré Abidjan",
        "Restaurant Sococé Abidjan",
        "Restaurant Riviera Faya Abidjan",
        "Restaurant Yopougon Abidjan",
        "Menu Chicken Nation",
        "Poulet grillé Abidjan",
        "Livraison repas Abidjan",
        "Fast food halal Abidjan",
        "Combo repas Abidjan",
        "Restauration rapide Côte d'Ivoire",
        "Chicken Nation CI",
        "Poulet local Abidjan",
        "Turbo Glovo Yango delivery",
    ],
    authors: [{ name: "CHICKEN NATION", url: "https://www.chicken-nation.com" }],
    creator: "CHICKEN NATION",
    publisher: "CHICKEN NATION",
    openGraph: {
        type: "website",
        locale: "fr_CI",
        url: SITE_URL,
        siteName: "CHICKEN NATION",
        title: TITRE_ACCUEIL,
        description: "Découvrez CHICKEN NATION, fast-food 100% poulet local élevé dans nos fermes. Burgers, wings, wraps, tenders et menus gourmands. Livraison rapide à Abidjan.",
        images: [IMAGE_PARTAGE],
    },
    twitter: {
        card: "summary_large_image",
        site: "@ChickenNationCI",
        creator: "@ChickenNationCI",
        images: [IMAGE_PARTAGE.url],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    category: "Restauration rapide",
    verification: {
        google: "-B0Ir9iTmPZHT-_7eQtFlG-b5v_AN1561-Q7zf-9PWQ",
        yandex: "1b5037f79415fff0",
    },
    other: {
        "og:phone_number": "+225 0720353535, +225 0747000034, +225 0700005556",
        "og:email": "info@chicken-nation.com",
        "og:latitude": "5.2860635",
        "og:longitude": "-3.9736923",
        "og:street-address": "Marcory Zone 4, Abidjan, Côte d'Ivoire",
        "og:locality": "Abidjan",
        "og:region": "Côte d'Ivoire",
        "og:country-name": "Côte d'Ivoire",
    },
};


// Le zoom reste permis : le bloquer gêne les personnes qui voient mal.
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
};

/**
 * Métadonnées propres à une page. Le contenu est en français sur toutes les
 * langues : l'adresse de référence est donc toujours la version /fr, pour que
 * Google ne compte pas /en et /ar comme des doublons.
 * Next remplace l'objet openGraph du parent au lieu de le fusionner : il faut
 * redonner ici l'image et le nom du site.
 */
export function pageMetadata({ chemin, titre, description }: { chemin: string; titre?: string; description: string }): Metadata {
    const url = `${SITE_URL}/fr${chemin === "/" ? "" : chemin}`;
    const titrePartage = titre ? `${titre} | CHICKEN NATION` : TITRE_ACCUEIL;
    return {
        ...(titre ? { title: titre } : { title: { absolute: TITRE_ACCUEIL } }),
        description,
        alternates: { canonical: url },
        openGraph: {
            type: "website",
            locale: "fr_CI",
            siteName: "CHICKEN NATION",
            url,
            title: titrePartage,
            description,
            images: [IMAGE_PARTAGE],
        },
        twitter: {
            card: "summary_large_image",
            title: titrePartage,
            description,
            images: [IMAGE_PARTAGE.url],
        },
    };
}

export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.chicken-nation.com",
    "name": "CHICKEN NATION",
    "url": "https://www.chicken-nation.com",
    "slogan": "Délicieux jusqu'à l'os",
    "description": "Fast-food spécialisé dans le poulet 100% local élevé dans nos propres fermes en Côte d'Ivoire.",
    "email": "info@chicken-nation.com",
    "telephone": ["+225 07 20 35 35 35", "+225 07 47 00 00 34", "+225 07 00 00 55 56"],
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Marcory Zone 4",
        "addressLocality": "Abidjan",
        "addressCountry": "CI"
    },
    "sameAs": [
        "https://twitter.com/ChickenNationCI",
        "https://www.instagram.com/chickennationci"
    ],
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Menu Chicken Nation",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "MenuItem",
                    "name": "Poulets grillés"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "MenuItem",
                    "name": "Burgers"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "MenuItem",
                    "name": "Wings"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "MenuItem",
                    "name": "Wraps"
                }
            }
        ]
    }
};