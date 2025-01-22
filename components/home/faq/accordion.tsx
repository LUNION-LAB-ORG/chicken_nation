import { Accordion, AccordionItem } from "@nextui-org/react";

export default function AccordionComponent() {
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <Accordion variant="splitted" className="text-primary-800">
      <AccordionItem
        key="1"
        aria-label="Accordion 1"
        title="Comment peut t-on faire une réservation ?"
        className="bg-primary-50 text-primary-800 text-sm" // Réduit la taille du texte et le padding
      >
        {defaultContent}
      </AccordionItem>
      <AccordionItem
        key="2"
        aria-label="Accordion 2"
        title="Proposez-vous des options végétariennes ?"
        className="bg-primary-50 text-primary-800 text-sm" // Réduit la taille du texte et le padding
      >
        {defaultContent}
      </AccordionItem>
      <AccordionItem
        key="3"
        aria-label="Accordion 3"
        title="Le stationnement est-il disponible ?"
        className="bg-primary-50 text-primary-800 text-sm" // Réduit la taille du texte et le padding
      >
        {defaultContent}
      </AccordionItem>
      <AccordionItem
        key="4"
        aria-label="Accordion 4"
        title="Quels sont vos horaires d'ouverture ?"
        className="bg-primary-50 text-primary-800 text-sm" // Réduit la taille du texte et le padding
      >
        {defaultContent}
      </AccordionItem>
    </Accordion>
  );
}
