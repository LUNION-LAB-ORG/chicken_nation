import type { Metadata, Viewport } from "next";

const SITE_URL = "https://www.chicken-nation.com";

const IMAGE_PARTAGE = {
    url: "/assets/images/partage/chicken-nation.jpg",
    width: 1200,
    height: 630,
    alt: "CHICKEN NATION, délicieux jusqu'à l'os",
};

// La commande en ligne figure dans le titre et la description : c'est ce que
// Google affiche, et la page d'accueil y mène en un clic.
const TITRE_ACCUEIL = "CHICKEN NATION : poulet à Abidjan, commande en ligne et livraison";
export const DESCRIPTION_ACCUEIL = "CHICKEN NATION, le poulet 100% local d'Abidjan. Commandez en ligne, en livraison ou à emporter. Restaurants à Zone 4, Angré, Sococé, Faya et Yopougon.";

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
        "Commande en ligne poulet Abidjan",
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
        description: DESCRIPTION_ACCUEIL,
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

/** Image de partage (Open Graph et Twitter) d'une page. */
export type ImagePartage = {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
};

/**
 * Métadonnées propres à une page. Le site est en français seulement :
 * l'adresse de référence est toujours la version /fr.
 * Next remplace l'objet openGraph du parent au lieu de le fusionner : il faut
 * redonner ici l'image et le nom du site.
 *
 * - `titre` : complété par le gabarit « %s | CHICKEN NATION » ;
 * - `titreAbsolu` : titre complet, sans gabarit (accueil, page d'un restaurant) ;
 * - sans l'un ni l'autre : titre de l'accueil ;
 * - `image` : image de partage de la page (par défaut l'image générale) ;
 * - `indexable: false` : `noindex` (les liens de la page restent suivis).
 */
export function pageMetadata({
    chemin,
    titre,
    titreAbsolu,
    description,
    image = IMAGE_PARTAGE,
    indexable = true,
}: {
    chemin: string;
    titre?: string;
    titreAbsolu?: string;
    description: string;
    image?: ImagePartage;
    indexable?: boolean;
}): Metadata {
    const url = `${SITE_URL}/fr${chemin === "/" ? "" : chemin}`;
    const titrePartage = titreAbsolu ?? (titre ? `${titre} | CHICKEN NATION` : TITRE_ACCUEIL);
    return {
        title: titreAbsolu ? { absolute: titreAbsolu } : titre ? titre : { absolute: TITRE_ACCUEIL },
        description,
        alternates: { canonical: url },
        // Remplace tout l'objet robots du parent (googleBot compris).
        ...(indexable ? {} : { robots: { index: false, follow: true } }),
        openGraph: {
            type: "website",
            locale: "fr_CI",
            siteName: "CHICKEN NATION",
            url,
            title: titrePartage,
            description,
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title: titrePartage,
            description,
            images: [image.url],
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
    // Numéro unique de commande par téléphone (les numéros ci-dessus sont ceux des restaurants).
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+225 27 21 71 21 30",
        "contactType": "customer service",
        "areaServed": "CI",
        "availableLanguage": "French"
    },
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