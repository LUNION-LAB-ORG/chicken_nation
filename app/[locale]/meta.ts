import type { Metadata } from "next";

export const metadata: Metadata = {
    metadataBase: new URL("https://www.chicken-nation.com"),
    title: {
        default: "CHICKEN NATION | Fast-Food 100% Poulet en Côte d'Ivoire",
        template: "%s | CHICKEN NATION - Délicieux jusqu'à l'os",
        absolute: "CHICKEN NATION - Le Meilleur du Poulet à Abidjan, Côte d'Ivoire",
    },
    description: "CHICKEN NATION, la référence du fast-food à Abidjan. Poulet 100% local élevé dans nos fermes. Croustillant, grillé ou épicé. Livraison rapide en moins de 30min. Restaurants à Zone 4, Angré-Djibi et Sococé.",
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-icon.png",
    },
    referrer: "origin-when-cross-origin",
    keywords: [
        "Chicken Nation Abidjan",
        "Fast food Côte d'Ivoire",
        "Poulet croustillant Abidjan",
        "Burger poulet Abidjan",
        "Restaurant Zone 4 Abidjan",
        "Restaurant Angré Abidjan",
        "Restaurant Sococé Abidjan",
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
    alternates: {
        canonical: "https://www.chicken-nation.com",
        languages: {
            "fr-CI": "https://www.chicken-nation.com",
        },
    },
    openGraph: {
        type: "website",
        locale: "fr_CI",
        url: "https://www.chicken-nation.com",
        siteName: "CHICKEN NATION",
        title: "CHICKEN NATION - Le Meilleur du Poulet à Abidjan, Côte d'Ivoire",
        description: "Découvrez CHICKEN NATION, fast-food 100% poulet local élevé dans nos fermes. Burgers, wings, wraps, tenders et menus gourmands. Livraison rapide à Abidjan.",
    },
    twitter: {
        card: "summary_large_image",
        site: "@ChickenNationCI",
        creator: "@ChickenNationCI",
    },
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
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
        google: "google-site-verification=-B0Ir9iTmPZHT-_7eQtFlG-b5v_AN1561-Q7zf-9PWQ",
        yandex: "1b5037f79415fff0",
    },
    other: {
        "og:phone_number": "+225 07 20 35 35 35, +225 07 47 00 00 34",
        "og:email": "info@chicken-nation.com",
        "og:latitude": "5.2860635",
        "og:longitude": "-3.9736923",
        "og:street-address": "Marcory Zone 4, Abidjan, Côte d'Ivoire",
        "og:locality": "Abidjan",
        "og:region": "Côte d'Ivoire",
        "og:country-name": "Côte d'Ivoire",
    },
};


export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.chicken-nation.com/#organization",
    "name": "CHICKEN NATION",
    "url": "https://www.chicken-nation.com",
    "logo": "https://www.chicken-nation.com/logo.png",
    "slogan": "Délicieux jusqu'à l'os",
    "description": "Fast-food spécialisé dans le poulet 100% local élevé dans nos propres fermes en Côte d'Ivoire.",
    "email": "info@chicken-nation.com",
    "telephone": ["+225 07 20 35 35 35", "+225 07 47 00 00 34"],
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