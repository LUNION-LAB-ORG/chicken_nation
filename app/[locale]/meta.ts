import type { Metadata, Viewport } from "next";

import {
  ID_ORGANISATION,
  SITE_URL,
  TELEPHONE_SCHEMA,
  adresseAbsolue,
} from "@/lib/seo/commun";
import { INSECABLE } from "@/lib/typo";

const IMAGE_PARTAGE = {
  url: "/assets/images/partage/chicken-nation.jpg",
  width: 1200,
  height: 630,
  alt: "CHICKEN NATION, délicieux jusqu'à l'os",
};

/** Couleur de la marque : barre d'adresse des téléphones et manifeste. */
export const COULEUR_THEME = "#FD8127";

// Titre et description de l'accueil (plan, 5.1) : ce que Google affiche, repris
// par toute page qui ne donne pas les siens.
const TITRE_ACCUEIL = `CHICKEN NATION${INSECABLE}: poulet pané, burgers et box à Abidjan`;

export const DESCRIPTION_ACCUEIL = `Poulet 100${INSECABLE}% local et halal, burgers et box. Commandez en ligne${INSECABLE}: livraison dans le Grand Abidjan ou retrait au restaurant. Ouvert 7${INSECABLE}j/7 dès 10${INSECABLE}h.`;

/**
 * Métadonnées communes à toutes les pages publiques.
 * Ni numéro de téléphone (`og:phone_number` retiré : seul le 27 21 71 21 30
 * est publié, dans le JSON-LD), ni compte Twitter : aucun compte vérifié.
 */
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
    "Poulet pané Abidjan",
    "Livraison repas Abidjan",
    "Fast food halal Abidjan",
    "Combo repas Abidjan",
    "Restauration rapide Côte d'Ivoire",
    "Chicken Nation CI",
    "Poulet local Abidjan",
    "Commande en ligne poulet Abidjan",
  ],
  authors: [{ name: "CHICKEN NATION", url: SITE_URL }],
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
};

// Le zoom reste permis : le bloquer gêne les personnes qui voient mal.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: COULEUR_THEME,
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
  const titrePartage =
    titreAbsolu ?? (titre ? `${titre} | CHICKEN NATION` : TITRE_ACCUEIL);

  return {
    title: titreAbsolu
      ? { absolute: titreAbsolu }
      : titre
        ? titre
        : { absolute: TITRE_ACCUEIL },
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

/** Nœud `WebSite` du graphe (nom du site dans les résultats de Google). */
export const ID_SITE_WEB = `${SITE_URL}/#website`;

/** Comptes officiels, ceux du pied de page : aucun autre n'est vérifié. */
export const RESEAUX_SOCIAUX = [
  "https://www.facebook.com/chickennationabj",
  "https://www.instagram.com/chickennationabj/",
] as const;

/**
 * Graphe JSON-LD publié sur toutes les pages publiques par leur mise en page :
 * l'organisation (`…/#organization`, cible du `parentOrganization` des
 * restaurants) et le site (`…/#website`).
 *
 * Seul numéro : le 27 21 71 21 30 (retouche 6). Ni numéro de restaurant, ni
 * adresse d'un restaurant présentée comme celle de la marque, ni catalogue
 * (le menu est publié par la carte), ni avis.
 */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ID_ORGANISATION,
      name: "CHICKEN NATION",
      alternateName: "Chicken Nation",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: adresseAbsolue("/icon.png"),
        width: 512,
        height: 512,
      },
      slogan: "Délicieux jusqu'à l'os",
      description: `Née de la passion du poulet de qualité, CHICKEN NATION sert un poulet 100${INSECABLE}% local et halal à Abidjan.`,
      email: "info@chicken-nation.com",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: TELEPHONE_SCHEMA,
        contactType: "customer service",
        areaServed: "CI",
        availableLanguage: "French",
      },
      sameAs: [...RESEAUX_SOCIAUX],
    },
    {
      "@type": "WebSite",
      "@id": ID_SITE_WEB,
      name: "CHICKEN NATION",
      alternateName: "Chicken Nation",
      url: `${SITE_URL}/fr`,
      inLanguage: "fr",
      publisher: { "@id": ID_ORGANISATION },
    },
  ],
};
