import { pageMetadata } from "../../meta";

export const faqMetadata = pageMetadata({
  chemin: "/faq",
  titre: "Questions fréquentes",
  description: "Trouvez les réponses à vos questions sur CHICKEN NATION : commandes, livraison, menu, horaires, paiements et plus encore.",
});

// Schema.org FAQ pour le SEO.
// Chaque question et chaque réponse reprennent le texte affiché par
// components/(public)/faq/faq.tsx : Google écarte un balisage qui ne
// correspond pas à la page. Modifier les deux ensemble.
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Comment puis-je commander ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "En ligne sur notre site www.chicken-nation.com : choisissez vos plats dans Nos menus, en livraison ou à emporter, et payez en ligne. Sur place dans nos restaurants (Zone 4, Angré, Sococé, Riviera Faya, Yopougon). Par téléphone au 27 21 71 21 30, ou directement au restaurant. Via notre application mobile Chicken Nation."
      }
    },
    {
      "@type": "Question",
      "name": "Puis-je commander sans installer l'application ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui. Ouvrez Nos menus, ajoutez vos plats, puis connectez-vous avec le code reçu sur WhatsApp. C'est le même compte que l'application."
      }
    },
    {
      "@type": "Question",
      "name": "Quelles sont les zones de livraison ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nous livrons partout dans Abidjan, même Bingerville et Grand-Bassam."
      }
    },
    {
      "@type": "Question",
      "name": "Quel est le délai de livraison moyen ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le délai moyen est de 20 à 35 minutes, selon votre emplacement."
      }
    },
    {
      "@type": "Question",
      "name": "Puis-je personnaliser mon burger ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, vous pouvez personnaliser votre burger selon vos préférences."
      }
    },
    {
      "@type": "Question",
      "name": "Quels moyens de paiement acceptez-vous ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nous acceptons les espèces, le Mobile Money (Orange Money, MTN Money, Wave, Moov Money) et la carte bancaire (Visa, Mastercard). Sur notre site, le paiement se fait uniquement en ligne."
      }
    },
    {
      "@type": "Question",
      "name": "Quels sont vos horaires d'ouverture ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tous nos restaurants sont ouverts 7 jours sur 7, dès 10h. Ils ferment vers minuit, un peu plus tard le week-end selon le restaurant. Les horaires de chacun sont sur la page Nos restaurants."
      }
    },
    {
      "@type": "Question",
      "name": "Peut-on réserver une table ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, contactez-nous par téléphone pour réserver : Zone 4 (Marcory) au 07 20 35 35 35, Angré-Djibi au 07 47 00 00 34, Sococé au 07 00 00 55 56, Riviera Faya au 07 20 20 83 52, Yopougon au 07 12 85 32 11. Vous pouvez également réserver une table en ligne sur notre application mobile Chicken Nation."
      }
    }
  ]
};
