import type { Metadata } from "next";

export type Lang = "fr" | "en";

export const getMetadata = (lang: Lang): Metadata => {
    const isFrench = lang === "fr";

    return {
        title: {
            default: isFrench
                ? "CHICKEN NATION | Fast-Food 100% Poulet en Côte d’Ivoire"
                : "CHICKEN NATION | 100% Chicken Fast-Food in Côte d’Ivoire",
            template: isFrench
                ? "%s | CHICKEN NATION - Délicieux jusqu’à l’os"
                : "%s | CHICKEN NATION - Delicious to the Bone",
            absolute: isFrench
                ? "CHICKEN NATION - Le Meilleur du Poulet à Abidjan, Côte d’Ivoire"
                : "CHICKEN NATION - The Best Chicken Restaurant in Abidjan, Côte d’Ivoire",
        },
        description: isFrench
            ? "CHICKEN NATION, la référence du fast-food à Abidjan. Spécialisé dans le poulet croustillant, grillé ou épicé. Dégustez nos burgers, wings, wraps et menus combo dans nos restaurants à Zone 4 et Angré."
            : "CHICKEN NATION, the leading chicken fast-food restaurant in Abidjan. Enjoy crispy, grilled, or spicy chicken — burgers, wings, wraps, and combo meals at our Zone 4 and Angré locations.",
        icons: {
            icon: "/favicon.ico",
            apple: "/apple-icon.png",
        },
        referrer: "origin-when-cross-origin",
        keywords: isFrench
            ? [
                "Chicken Nation Abidjan",
                "Fast food Côte d’Ivoire",
                "Poulet croustillant Abidjan",
                "Burger poulet Abidjan",
                "Restaurant Zone 4 Abidjan",
                "Restaurant Angré Abidjan",
                "Menu Chicken Nation",
                "Poulet grillé Abidjan",
                "Livraison repas Abidjan",
                "Fast food halal Abidjan",
                "Combo repas Abidjan",
                "Restauration rapide Côte d’Ivoire",
                "Chicken Nation CI",
            ]
            : [
                "Chicken Nation Abidjan",
                "Fast food Ivory Coast",
                "Crispy chicken Abidjan",
                "Grilled chicken Abidjan",
                "Chicken burger Abidjan",
                "Chicken wrap Abidjan",
                "Food delivery Abidjan",
                "Halal fast food Abidjan",
                "Combo meals Abidjan",
                "Chicken Nation Ivory Coast",
            ],
        authors: [{ name: "CHICKEN NATION", url: "https://www.chicken-nation.com" }],
        creator: "CHICKEN NATION",
        publisher: "CHICKEN NATION",
        alternates: {
            canonical: isFrench
                ? "https://www.chicken-nation.com"
                : "https://www.chicken-nation.com/en",
            languages: {
                "fr-CI": "https://www.chicken-nation.com",
                "en-US": "https://www.chicken-nation.com/en",
            },
        },
        openGraph: {
            type: "website",
            locale: isFrench ? "fr_CI" : "en_US",
            url: isFrench
                ? "https://www.chicken-nation.com"
                : "https://www.chicken-nation.com/en",
            siteName: "CHICKEN NATION",
            title: isFrench
                ? "CHICKEN NATION - Le Meilleur du Poulet à Abidjan, Côte d’Ivoire"
                : "CHICKEN NATION - The Best Chicken in Abidjan, Côte d’Ivoire",
            description: isFrench
                ? "Découvrez CHICKEN NATION, fast-food 100% poulet à Abidjan. Burgers, wings, wraps, tenders et menus gourmands servis dans une ambiance conviviale."
                : "Discover CHICKEN NATION, the 100% chicken fast-food restaurant in Abidjan. Burgers, wings, wraps, tenders, and delicious combo meals served in a friendly atmosphere.",
            images: [
                {
                    url: isFrench
                        ? "https://www.chicken-nation.com/og-image.jpg"
                        : "https://www.chicken-nation.com/og-image-en.jpg",
                    width: 630,
                    height: 630,
                    alt: isFrench
                        ? "CHICKEN NATION - Fast food 100% poulet en Côte d’Ivoire"
                        : "CHICKEN NATION - 100% Chicken Fast Food in Côte d’Ivoire",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            site: "@ChickenNationCI",
            creator: "@ChickenNationCI",
            title: isFrench
                ? "CHICKEN NATION - Fast-Food 100% Poulet à Abidjan"
                : "CHICKEN NATION - 100% Chicken Fast-Food in Abidjan",
            description: isFrench
                ? "Savourez nos burgers, wings et wraps faits avec amour. Chicken Nation, délicieux jusqu’à l’os !"
                : "Enjoy our burgers, wings, and wraps made with love. Chicken Nation — delicious to the bone!",
            images: [
                isFrench
                    ? "https://www.chicken-nation.com/twitter-image.jpg"
                    : "https://www.chicken-nation.com/twitter-image-en.jpg",
            ],
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
        category: isFrench ? "Restauration rapide" : "Fast Food Restaurant",
        verification: {
            google: "google-site-verification=XXXXXXXXXXXXXXX",
            yandex: "XXXXXXXXXXXXXXX",
            other: { bing: "XXXXXXXXXXXXXXX" },
        },
        other: {
            "fb:app_id": "1075289994232342",
            "og:phone_number": "+225 07 77 777 777",
            "og:email": "contact@chicken-nation.com",
            "og:latitude": "5.309660",
            "og:longitude": "-3.996790",
            "og:street-address":
                "Marcory Zone 4, Rue du 7 Décembre | Abidjan, Côte d’Ivoire",
            "og:locality": "Abidjan",
            "og:region": "Côte d’Ivoire",
            "og:postal-code": "01 BP 1234 Abidjan 01",
            "og:country-name": "Côte d’Ivoire",
        },
    };
};
