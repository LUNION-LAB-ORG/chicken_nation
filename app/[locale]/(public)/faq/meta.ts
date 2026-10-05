import type { IConfigFidelite } from "@/features/fidelite/fidelite.api";

import { pageMetadata } from "../../meta";

import { fcfa, nombre, TELEPHONE, telLien } from "@/lib/typo";

export const faqMetadata = pageMetadata({
  chemin: "/faq",
  titre: "Questions fréquentes",
  description:
    "Trouvez les réponses à vos questions sur CHICKEN NATION : commandes, livraison, menu, horaires, paiements et plus encore.",
});

/** Morceau de réponse : texte simple ou lien (le texte du lien compte comme texte). */
export type MorceauFaq = string | { texte: string; href: string };

/** Ligne de réponse : un texte seul, ou une suite de morceaux avec des liens. */
export type LigneFaq = string | MorceauFaq[];

/** Paragraphe, ou liste à puces. */
export type BlocFaq = LigneFaq | { liste: LigneFaq[] };

export interface QuestionFaq {
  question: string;
  reponse: BlocFaq[];
}

export interface RubriqueFaq {
  id: string;
  titre: string;
  questions: QuestionFaq[];
}

// Seul numéro publié (retouche 6), toujours cliquable.
const TEL: MorceauFaq = { texte: TELEPHONE, href: telLien() };
const EMAIL: MorceauFaq = {
  texte: "info@chicken-nation.com",
  href: "mailto:info@chicken-nation.com",
};

/**
 * Questions de la FAQ, rangées par rubrique. UN SEUL tableau sert à la page et
 * au JSON-LD FAQPage : Google écarte un balisage qui ne reprend pas mot pour
 * mot le texte affiché. Seul numéro cité : le 27 21 71 21 30 (retouche 6).
 * Les chiffres de fidélité viennent de `GET /fidelity/loyalty/config`
 * (règle 3 du plan), les faits du programme de la retouche 2.
 */
export function questionsFaq(fidelite: IConfigFidelite): RubriqueFaq[] {
  return [
    {
      id: "commander",
      titre: "Commander",
      questions: [
        {
          question: "Comment puis-je commander ?",
          reponse: [
            "Plusieurs options s'offrent à vous :",
            {
              liste: [
                [
                  "En ligne sur notre site : choisissez vos plats sur ",
                  { texte: "la carte", href: "/fr/carte" },
                  ", en livraison ou à emporter, et payez en ligne.",
                ],
                "Dans notre application mobile Chicken Nation, sur Android et iPhone.",
                ["Par téléphone au ", TEL, "."],
                [
                  "Sur place, dans l'un de ",
                  { texte: "nos restaurants", href: "/fr/restaurants" },
                  ".",
                ],
              ],
            },
          ],
        },
        {
          question: "Puis-je commander sans installer l'application ?",
          reponse: [
            [
              "Oui. Ouvrez ",
              { texte: "la carte", href: "/fr/carte" },
              ", ajoutez vos plats, puis connectez-vous avec le code reçu sur WhatsApp. C'est le même compte que l'application.",
            ],
          ],
        },
        {
          question: "Puis-je personnaliser mon burger ?",
          reponse: [
            "Oui, vous pouvez personnaliser votre burger selon vos préférences.",
          ],
        },
        {
          question: "Comment sont préparés les plats ?",
          reponse: [
            "Tous nos plats sont préparés à la commande avec des ingrédients frais et de qualité. Notre poulet est mariné avec amour et frit à la perfection.",
          ],
        },
        {
          question: "Proposez-vous des services pour les entreprises ?",
          reponse: [
            "Nous travaillons sur une offre dédiée aux entreprises. Ce service sera bientôt disponible.",
          ],
        },
      ],
    },
    {
      id: "livraison-paiement",
      titre: "Livraison et paiement",
      questions: [
        {
          question: "Quelles sont les zones de livraison ?",
          reponse: [
            "Nous livrons partout dans Abidjan, même Bingerville et Grand-Bassam.",
          ],
        },
        {
          question: "Quel est le délai de livraison moyen ?",
          reponse: [
            "Le délai moyen est de 20 à 35 minutes, selon votre emplacement.",
          ],
        },
        {
          question: "Quels moyens de paiement acceptez-vous ?",
          reponse: [
            "Nous acceptons les espèces, le Mobile Money (Orange Money, MTN Money, Wave, Moov Money) et la carte bancaire (Visa, Mastercard). Sur notre site, le paiement se fait uniquement en ligne.",
          ],
        },
        {
          question: "Où saisir un code promo ou un bon d'achat ?",
          reponse: [
            "Au moment de payer, sur le site comme dans l'application.",
          ],
        },
        {
          question: "Que faire en cas de problème avec ma commande ?",
          reponse: [
            [
              "Contactez immédiatement notre service client au ",
              TEL,
              ". Nous résoudrons rapidement votre réclamation. Votre satisfaction est notre priorité !",
            ],
          ],
        },
      ],
    },
    {
      id: "fidelite",
      titre: "Fidélité et Carte de la Nation",
      questions: [
        {
          question: "Comment gagner et utiliser mes points ?",
          reponse: [
            `Chaque commande payée en ligne, sur le site ou dans l'application, vous rapporte 1 point par tranche de ${fcfa(fidelite.tranche)} de plats (avant remises, hors livraison). Les commandes au téléphone ou payées en espèces ne rapportent pas de points.`,
            `Au moment de payer, choisissez combien de points utiliser : 1 point vaut ${fcfa(fidelite.valeurPoint)} de réduction, dès ${nombre(fidelite.minimumPoints)} points, jusqu'à ${nombre(fidelite.plafondPct)} % du prix des plats. Les points sont valables ${nombre(fidelite.joursValidite)} jours. On utilise soit ses points, soit un code promo, pas les deux.`,
          ],
        },
        {
          question: "Comment fonctionnent les niveaux VIP et VVIP ?",
          reponse: [
            `Vous passez VIP à ${nombre(fidelite.seuilVip)} points gagnés dans l'année, VVIP à ${nombre(fidelite.seuilVvip)}. ${nombre(fidelite.bonusVip)} points vous sont offerts en passant VIP, ${nombre(fidelite.bonusVvip)} en passant VVIP. Le niveau repart de zéro chaque 1er janvier.`,
          ],
        },
        {
          question: "Qu'est-ce que le Gratte et Gagne ?",
          reponse: [
            "Après chaque commande payée en ligne, une carte à gratter vous attend dans l'application. Elle révèle vos points et cache parfois un cadeau (plat, boisson, accompagnement ou bon d'achat), surtout sur les plus grosses commandes.",
            "Le grattage se fait seulement dans l'application. Le cadeau s'utilise dans l'application ou sur le site, avant sa date limite.",
          ],
        },
        {
          question: "Avez-vous une carte de fidélité ?",
          reponse: [
            "Oui. La Carte de la Nation est gratuite et ouverte à tous. Demandez-la sur le site ou dans l'application : notre équipe valide votre demande, vous êtes prévenu par notification et sur WhatsApp, puis vous retrouvez votre carte dans l'application, aux couleurs de votre niveau.",
            [
              {
                texte: "Demander ma Carte de la Nation",
                href: "/fr/carte-nation/adhesion",
              },
            ],
          ],
        },
      ],
    },
    {
      id: "restaurants",
      titre: "Nos restaurants",
      questions: [
        {
          question: "Quels sont vos horaires d'ouverture ?",
          reponse: [
            [
              "Tous nos restaurants sont ouverts 7 jours sur 7, dès 10 h. Ils ferment vers minuit, un peu plus tard le week-end selon le restaurant. Les horaires de chacun sont sur la page ",
              { texte: "Nos restaurants", href: "/fr/restaurants" },
              ".",
            ],
          ],
        },
        {
          question: "Peut-on réserver une table ?",
          reponse: [
            [
              "Oui, appelez-nous au ",
              TEL,
              " pour réserver. Vous pouvez également réserver une table en ligne sur notre application mobile Chicken Nation.",
            ],
          ],
        },
        {
          question: "Quelles mesures d'hygiène appliquez-vous ?",
          reponse: [
            "Votre santé est notre priorité :",
            {
              liste: [
                "Respect strict des normes sanitaires internationales",
                "Poulet 100 % local élevé dans nos propres fermes",
                "Contrôles qualité réguliers",
                "Ingrédients frais sélectionnés avec soin",
              ],
            },
          ],
        },
        {
          question: "Comment puis-je vous contacter ?",
          reponse: [
            [
              "Par téléphone au ",
              TEL,
              ", par e-mail à ",
              EMAIL,
              ", ou depuis notre ",
              { texte: "page Contact", href: "/fr/contact" },
              ". Sur Facebook et Instagram : chickennationabj.",
            ],
          ],
        },
      ],
    },
  ];
}

/** Morceaux d'une ligne (un texte seul devient un morceau unique). */
export const morceaux = (ligne: LigneFaq): MorceauFaq[] =>
  typeof ligne === "string" ? [ligne] : ligne;

/** Texte d'une ligne, tel qu'il est affiché (le texte des liens compris). */
export const texteLigne = (ligne: LigneFaq) =>
  morceaux(ligne)
    .map((m) => (typeof m === "string" ? m : m.texte))
    .join("");

/**
 * Réponse en texte brut pour le JSON-LD : les mêmes mots que la page, un
 * paragraphe ou un élément de liste par ligne.
 */
export function texteReponse(reponse: BlocFaq[]): string {
  return reponse
    .map((bloc) =>
      typeof bloc === "object" && "liste" in bloc
        ? bloc.liste.map(texteLigne).join("\n")
        : texteLigne(bloc),
    )
    .join("\n");
}

/** JSON-LD FAQPage construit sur le même tableau que la page. */
export function faqSchema(rubriques: RubriqueFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: rubriques.flatMap((rubrique) =>
      rubrique.questions.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: texteReponse(q.reponse),
        },
      })),
    ),
  };
}
