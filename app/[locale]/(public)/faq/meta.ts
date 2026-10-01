import { pageMetadata } from "../../meta";

export const faqMetadata = pageMetadata({
  chemin: "/faq",
  titre: "Questions fréquentes",
  description: "Trouvez les réponses à vos questions sur CHICKEN NATION : commandes, livraison, menu, horaires, paiements et plus encore.",
});

// Schema.org FAQ pour le SEO
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Comment puis-je commander chez Chicken Nation ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vous pouvez commander de plusieurs façons : sur place dans nos restaurants à Zone 4, Angré, Sococé, Riviera Faya ou Yopougon, par téléphone au +225 0747000034, via notre application mobile disponible sur l'App Store et Google Play Store, ou via nos partenaires de livraison (Turbo, Glovo, Yango)."
      }
    },
    {
      "@type": "Question",
      "name": "Quelles sont les zones de livraison ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nous livrons partout dans le Grand Abidjan, y compris Bingerville et Grand-Bassam. La livraison prend en moyenne 20 à 35 minutes selon votre localisation."
      }
    },
    {
      "@type": "Question",
      "name": "Quels sont les horaires d'ouverture de Chicken Nation ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tous nos restaurants sont ouverts 7 jours sur 7, de 10h00 à 23h00."
      }
    },
    {
      "@type": "Question",
      "name": "Quels moyens de paiement acceptez-vous ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nous acceptons les paiements en espèces, mobile money (Orange Money, MTN Money, Wave, Moov Money) et carte bancaire."
      }
    },
    {
      "@type": "Question",
      "name": "Proposez-vous des options végétariennes ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, nous proposons une salade de choux disponible en supplément ou en accompagnement."
      }
    },
    {
      "@type": "Question",
      "name": "Puis-je personnaliser mon burger ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, vous pouvez personnaliser votre burger selon vos préférences. N'hésitez pas à demander lors de votre commande."
      }
    },
    {
      "@type": "Question",
      "name": "Comment réserver une table ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pour réserver une table, appelez directement le restaurant : Zone 4 au 07 20 35 35 35, Angré au 07 47 00 00 34, Sococé au 07 00 00 55 56, Riviera Faya au 07 20 20 83 52, Yopougon au 07 12 85 32 11."
      }
    }
  ]
};
