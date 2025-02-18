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
      />

      <AccordionItem
        key="3"
        aria-label="Délai de livraison"
        title="Quel est le délai de livraison moyen ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="4"
        aria-label="Minimum de commande"
        title="Y a-t-il un minimum de commande pour la livraison ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="5"
        aria-label="Options végétariennes"
        title="Proposez-vous des options végétariennes ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="6"
        aria-label="Gestion allergènes"
        title="Comment gérez-vous les allergènes ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="7"
        aria-label="Personnalisation burger"
        title="Puis-je personnaliser mon burger ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="8"
        aria-label="Prix et taxes"
        title="Les prix affichés incluent-ils les taxes ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="9"
        aria-label="Moyens de paiement"
        title="Quels moyens de paiement acceptez-vous ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="10"
        aria-label="Carte fidélité"
        title="Avez-vous une carte de fidélité ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="11"
        aria-label="Points fidélité"
        title="Comment utiliser mes points fidélité ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="12"
        aria-label="Horaires"
        title="Quels sont vos horaires d'ouverture ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="13"
        aria-label="Réservation"
        title="Peut-on réserver une table ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="14"
        aria-label="Services entreprises"
        title="Proposez-vous des services pour les entreprises ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="15"
        aria-label="Mesures hygiène"
        title="Quelles mesures d'hygiène appliquez-vous ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="16"
        aria-label="Préparation plats"
        title="Comment sont préparés les plats ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="17"
        aria-label="Contact"
        title="Comment puis-je vous contacter ?"
        className="bg-gray-100 text-black text-sm p-2"
      />

      <AccordionItem
        key="18"
        aria-label="Problème commande"
        title="Que faire en cas de problème avec ma commande ?"
        className="bg-gray-100 text-black text-sm p-2"
      />
    </Accordion>
  );
}