"use client";

import { Accordion, AccordionItem } from "@heroui/accordion";
import { Link } from "@/i18n/navigation";

// Le JSON-LD de app/[locale]/(public)/faq/meta.ts reprend une partie de ces
// questions mot pour mot : Google écarte un balisage qui ne correspond pas au
// texte affiché. Modifier les deux ensemble.
const faqs = [
  {
    key: "1",
    question: "Comment puis-je commander ?",
    answer: (
      <div className="space-y-3">
        <p className="font-medium text-gray-700">
          Plusieurs options s&apos;offrent à vous :
        </p>
        <ul className="list-none space-y-2">
          <li className="flex items-center gap-2">
            <span className="text-primary-600">🛒</span>
            <span>
              En ligne sur notre site : choisissez vos plats dans{" "}
              <Link
                href="/restaurants/nos-menus"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                Nos menus
              </Link>
              , en livraison ou à emporter, et payez en ligne.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary-600">🏪</span>
            <span>
              Sur place dans nos restaurants (Zone 4, Angré, Sococé, Riviera Faya, Yopougon)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary-600">📞</span>
            <span>
              Par téléphone au{" "}
              <a
                href="tel:+2252721712130"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                27 21 71 21 30
              </a>
              , ou directement au restaurant :{" "}
              <a
                href="tel:+2250720353535"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                07 20 35 35 35
              </a>{" "}
              /{" "}
              <a
                href="tel:+2250747000034"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                07 47 00 00 34
              </a>{" "}
              /{" "}
              <a
                href="tel:+2250700005556"
                className="font-semibold text-primary-600 hover:text-primary-500"
              >
                07 00 00 55 56
              </a>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary-600">📱</span>
            <span>
              Via notre application mobile <strong>Chicken Nation</strong>
            </span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    key: "2",
    question: "Puis-je commander sans installer l'application ?",
    answer: (
      <p>
        Oui. Ouvrez{" "}
        <Link
          href="/restaurants/nos-menus"
          className="font-semibold text-primary-600 hover:underline"
        >
          Nos menus
        </Link>
        , ajoutez vos plats, puis connectez-vous avec le code reçu sur WhatsApp.
        C&apos;est le même compte que l&apos;application.
      </p>
    ),
  },
  {
    key: "3",
    question: "Quelles sont les zones de livraison ?",
    answer:
      "Nous livrons partout dans Abidjan, même Bingerville et Grand-Bassam.",
  },
  {
    key: "4",
    question: "Quel est le délai de livraison moyen ?",
    answer: "Le délai moyen est de 20 à 35 minutes, selon votre emplacement.",
  },
  {
    key: "5",
    question: "Puis-je personnaliser mon burger ?",
    answer:
      "Oui, vous pouvez personnaliser votre burger selon vos préférences.",
  },
  {
    key: "6",
    question: "Quels moyens de paiement acceptez-vous ?",
    answer: (
      <div className="space-y-2">
        <p>Nous acceptons plusieurs moyens de paiement :</p>
        <ul className="list-none space-y-1 ml-2">
          <li>
            💵 <strong>Espèces</strong>
          </li>
          <li>
            📱 <strong>Mobile Money</strong> (Orange Money, MTN Money, Wave,
            Moov Money)
          </li>
          <li>
            💳 <strong>Carte bancaire</strong> (Visa, Mastercard)
          </li>
        </ul>
        {/* Le serveur refuse les espèces pour une commande passée sur le site. */}
        <p>Sur notre site, le paiement se fait uniquement en ligne.</p>
      </div>
    ),
  },
  {
    key: "7",
    question: "Avez-vous une carte de fidélité ?",
    answer: (
      <div className="space-y-2">
        <p>
          Oui ! La <strong className="text-primary-600">Carte Nation</strong>{" "}
          donne accès à des menus et des prix réservés à ses membres.
        </p>
        <p>
          <Link href="/carte-nation/adhesion" className="font-semibold text-primary-600 underline">
            Demandez votre carte en ligne
          </Link>{" "}
          : une fois votre demande validée, elle vous arrive sur WhatsApp.
        </p>
      </div>
    ),
  },
  {
    key: "8",
    question: "Comment utiliser mes points fidélité ?",
    answer: (
      <div className="space-y-2">
        <p>
          Vous gagnez des points à chaque commande payée en ligne, dans
          l&apos;application comme sur le site.
        </p>
        <p>
          Au moment de commander, choisissez combien de points utiliser : ils
          deviennent une réduction sur votre commande. On utilise soit ses
          points, soit un code promo, pas les deux.
        </p>
      </div>
    ),
  },
  {
    key: "9",
    question: "Quels sont vos horaires d'ouverture ?",
    answer: (
      <div className="space-y-2">
        <p className="font-semibold text-primary-600">
          Tous nos restaurants sont ouverts 7 jours sur 7, dès 10h.
        </p>
        <p className="ml-2">
          🕐 Ils ferment vers minuit, un peu plus tard le week-end selon le
          restaurant. Les horaires de chacun sont sur la page{" "}
          <Link href="/restaurants" className="font-semibold text-primary-600 underline">
            Nos restaurants
          </Link>
          .
        </p>
      </div>
    ),
  },
  {
    key: "10",
    question: "Peut-on réserver une table ?",
    answer: (
      <div className="space-y-2">
        <p>Oui, contactez-nous par téléphone pour réserver :</p>
        <ul className="list-none space-y-1 ml-2">
          <li>
            📞 <strong className="text-primary-600">Zone 4 (Marcory) :</strong>{" "}
            <a href="tel:+2250720353535" className="hover:underline">
              07 20 35 35 35
            </a>
          </li>
          <li>
            📞{" "}
            <strong className="text-primary-600">Angré-Djibi :</strong>{" "}
            <a href="tel:+2250747000034" className="hover:underline">
              07 47 00 00 34
            </a>
          </li>
          <li>
            📞{" "}
            <strong className="text-primary-600">Sococé :</strong>{" "}
            <a href="tel:+2250700005556" className="hover:underline">
              07 00 00 55 56
            </a>
          </li>
          <li>
            📞{" "}
            <strong className="text-primary-600">Riviera Faya :</strong>{" "}
            <a href="tel:+2250720208352" className="hover:underline">
              07 20 20 83 52
            </a>
          </li>
          <li>
            📞{" "}
            <strong className="text-primary-600">Yopougon :</strong>{" "}
            <a href="tel:+2250712853211" className="hover:underline">
              07 12 85 32 11
            </a>
          </li>
        </ul>
        <p>
          Vous pouvez également réserver une table en ligne sur notre application
          mobile Chicken Nation.
        </p>
      </div>
    ),
  },
  {
    key: "11",
    question: "Proposez-vous des services pour les entreprises ?",
    answer:
      "Nous travaillons sur une offre dédiée aux entreprises. Ce service sera bientôt disponible.",
  },
  {
    key: "12",
    question: "Quelles mesures d'hygiène appliquez-vous ?",
    answer: (
      <div className="space-y-2">
        <p>Votre santé est notre priorité :</p>
        <ul className="list-none space-y-1 ml-2">
          <li>✅ Respect strict des normes sanitaires internationales</li>
          <li>✅ Poulet 100% local élevé dans nos propres fermes</li>
          <li>✅ Contrôles qualité réguliers</li>
          <li>✅ Ingrédients frais sélectionnés avec soin</li>
        </ul>
      </div>
    ),
  },
  {
    key: "13",
    question: "Comment sont préparés les plats ?",
    answer:
      "Tous nos plats sont préparés à la commande avec des ingrédients frais et de qualité. Notre poulet est mariné avec amour et frit à la perfection.",
  },
  {
    key: "14",
    question: "Comment puis-je vous contacter ?",
    answer: (
      <div className="space-y-2">
        <p className="font-medium">Plusieurs moyens de nous joindre :</p>
        <ul className="list-none space-y-1 ml-2">
          <li>
            📞 <strong>Zone 4 :</strong>{" "}
            <a
              href="tel:+2250720353535"
              className="text-primary-600 hover:underline"
            >
              07 20 35 35 35
            </a>
          </li>
          <li>
            📞 <strong>Angré-Djibi :</strong>{" "}
            <a
              href="tel:+2250747000034"
              className="text-primary-600 hover:underline"
            >
              07 47 00 00 34
            </a>
          </li>
          <li>
            📞 <strong>Sococé :</strong>{" "}
            <a
              href="tel:+2250700005556"
              className="text-primary-600 hover:underline"
            >
              07 00 00 55 56
            </a>
          </li>
          <li>
            📞 <strong>Riviera Faya :</strong>{" "}
            <a
              href="tel:+2250720208352"
              className="text-primary-600 hover:underline"
            >
              07 20 20 83 52
            </a>
          </li>
          <li>
            📞 <strong>Yopougon :</strong>{" "}
            <a
              href="tel:+2250712853211"
              className="text-primary-600 hover:underline"
            >
              07 12 85 32 11
            </a>
          </li>
          <li>
            ✉️ <strong>Email :</strong>{" "}
            <a
              href="mailto:info@chicken-nation.com"
              className="text-primary-600 hover:underline"
            >
              info@chicken-nation.com
            </a>
          </li>
          <li>
            📱 <strong>Réseaux sociaux :</strong> @ChickenNationCI
          </li>
        </ul>
      </div>
    ),
  },
  {
    key: "15",
    question: "Que faire en cas de problème avec ma commande ?",
    answer: (
      <div className="space-y-2">
        <p>
          Contactez immédiatement notre service client au{" "}
          <a
            href="tel:+2250720353535"
            className="font-semibold text-primary-600 hover:underline"
          >
            07 20 35 35 35
          </a>{" "}
          / {" "}
          <a
            href="tel:+2250747000034"
            className="font-semibold text-primary-600 hover:underline"
          >
            07 47 00 00 34
          </a>{" "}
          ou au{" "}
          <a
            href="tel:+2250700005556"
            className="font-semibold text-primary-600 hover:underline"
          >
            07 00 00 55 56
          </a>
          .
        </p>
        <p>
          Nous résoudrons rapidement votre réclamation. Votre satisfaction est
          notre priorité !
        </p>
      </div>
    ),
  },
];

export default function FAQ() {
  return (
    <div className="w-full max-w-screen-md mx-auto">
      <Accordion
        variant="splitted"
        selectionMode="multiple"
        className="gap-3"
        itemClasses={{
          base: "px-4 py-2 bg-white shadow-md rounded-xl border border-gray-200 hover:border-primary-300 transition-all",
          title:
            "font-semibold text-gray-800 text-base group-data-[open=true]:text-primary-600",
          trigger: "py-4 rounded-xl data-[hover=true]:bg-primary-100/50",
          indicator: "text-primary-600 data-[open=true]:rotate-180",
          content: "pt-2 pb-4 px-2 text-gray-700 text-sm leading-relaxed",
        }}
      >
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.key}
            aria-label={faq.question}
            title={faq.question}
            indicator={({ isOpen }) => (
              <svg
                className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          >
            {typeof faq.answer === "string" ? <p>{faq.answer}</p> : faq.answer}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
