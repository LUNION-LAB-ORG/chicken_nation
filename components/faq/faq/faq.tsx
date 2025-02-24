"use client";

import { Accordion, AccordionItem } from "@heroui/react";

export default function Quiz() {
  return (
    <Accordion variant="splitted" className="text-primary-800">
      <AccordionItem
        key="1"
        aria-label="Comment puis-je commander"
        title="Comment puis-je commander ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <div className="space-y-2">
          <p>Plusieurs options s&apos;offrent à vous :</p>
          <ul className="list-none space-y-1">
            <li>- Sur place dans notre restaurant</li>
            <li>- Par téléphone au +225 0747000034</li>
            <li>- Via notre application mobile Turbo</li>
            <li>- Sur notre site web</li>
            <li>- Via les plateformes de livraison partenaires (Turbo Delivery)</li>
          </ul>
        </div>
      </AccordionItem>

      <AccordionItem
        key="2"
        aria-label="Zones de livraison"
        title="Quelles sont les zones de livraison ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Nous livrons partout dans Abidjan, même Bingerville et Bassam</p>
      </AccordionItem>

      <AccordionItem
        key="3"
        aria-label="Délai de livraison"
        title="Quel est le délai de livraison moyen ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Le délai moyen est de 20 à 35 minutes, selon votre emplacement.</p>
      </AccordionItem>

      <AccordionItem
        key="4"
        aria-label="Minimum de commande"
        title="Y a-t-il un minimum de commande pour la livraison ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Oui, un minimum de 5000 FCFA est requis pour la livraison.</p>
      </AccordionItem>

      <AccordionItem
        key="5"
        aria-label="Options végétariennes"
        title="Proposez-vous des options végétariennes ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Nous avons une option végétarienne : notre salade de choux , qui est disponible en supplément </p>
      </AccordionItem>

      <AccordionItem
        key="7"
        aria-label="Personnalisation burger"
        title="Puis-je personnaliser mon burger ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Oui, cela est bien possible</p>
      </AccordionItem>

      <AccordionItem
        key="8"
        aria-label="Prix et taxes"
        title="Les prix affichés incluent-ils les taxes ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Oui, nos prix incluent toutes les taxes.</p>
      </AccordionItem>

      <AccordionItem
        key="9"
        aria-label="Moyens de paiement"
        title="Quels moyens de paiement acceptez-vous ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Nous acceptons les paiements en espèces, mobile money et carte bancaire.</p>
      </AccordionItem>

      <AccordionItem
        key="10"
        aria-label="Carte fidélité"
        title="Avez-vous une carte de fidélité ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Bientôt disponible sur l&apos;application de Chicken Nation uniquement</p>
      </AccordionItem>

      <AccordionItem
        key="11"
        aria-label="Points fidélité"
        title="Comment utiliser mes points fidélité ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Les conditions d'éligibilité et les conditions générales d'utilisations de la carte de fidélités, vous seront communniquées très prochainement via l'application</p>
      </AccordionItem>

      <AccordionItem
        key="12"
        aria-label="Horaires"
        title="Quels sont vos horaires d'ouverture ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Nous sommes ouverts du lundi au Vendredi de 10h30 à 23h et les week end de 10h30 à minuit</p>
      </AccordionItem>

      <AccordionItem
        key="13"
        aria-label="Réservation"
        title="Peut-on réserver une table ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Pour effectuer une réservation, nous vous invitons à nous contacter par téléphone aux numéros : 07 47 00 00 34 - chicken nation angré 07 20 35 35 35 - chicken nation marcory zone 4</p>
      </AccordionItem>

      <AccordionItem
        key="14"
        aria-label="Services entreprises"
        title="Proposez-vous des services pour les entreprises ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Bientôt disponible</p>
      </AccordionItem>

      <AccordionItem
        key="15"
        aria-label="Mesures hygiène"
        title="Quelles mesures d'hygiène appliquez-vous ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Nous suivons strictement les normes sanitaires en vigueur.</p>
      </AccordionItem>

      <AccordionItem
        key="16"
        aria-label="Préparation plats"
        title="Comment sont préparés les plats ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Nos plats sont préparés avec des ingrédients frais et de qualité.</p>
      </AccordionItem>

      <AccordionItem
        key="17"
        aria-label="Contact"
        title="Comment puis-je vous contacter ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Contactez-nous via téléphone : 07 47 00 00 34 - chicken nation angré; 07 20 35 35 35 - chicken nation marcory zone 4</p>
      </AccordionItem>

      <AccordionItem
        key="18"
        aria-label="Problème commande"
        title="Que faire en cas de problème avec ma commande ?"
        className="bg-gray-100 text-black text-sm p-2"
      >
        <p>Appelez notre service client pour toute réclamation.</p>
      </AccordionItem>
    </Accordion>
  );
}
