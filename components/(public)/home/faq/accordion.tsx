import { Accordion, AccordionItem } from "@heroui/react";

export default function AccordionComponent() {
  const Content1 =
    "Pour effectuer une réservation, nous vous invitons à nous contacter par téléphone aux numéros : 07 47 00 00 34 - chicken nation angré 07 20 35 35 35 - chicken nation marcory zone 4";
    const Content2 =
    "Nous avons une option végétarienne : notre salade de choux , qui est disponible en supplément ";
    const Content3 =
    "Nous avons un parking disponible juste devant notre fastfood pour votre commodité, n'hésitez pas à vous garer lors de votre visite ";
    const Content4 =
    "Nous sommes ouverts du lundi au Vendredi de 10h30 à 23h et les week end de 10h30 à minuit ";  

  return (
    <Accordion variant="splitted" className="text-primary-800">
      <AccordionItem
        key="1"
        aria-label="Accordion 1"
        title="Comment peut t-on faire une réservation ?"
        className="bg-primary-50 text-primary-800 text-sm text-start" // Réduit la taille du texte et le padding
      >
        {Content1}
      </AccordionItem>
      <AccordionItem
        key="2"
        aria-label="Accordion 2"
        title="Proposez-vous des options végétariennes ?"
        className="bg-primary-50 text-primary-800 text-sm text-start" // Réduit la taille du texte et le padding
      >
        {Content2}
      </AccordionItem>
      <AccordionItem
        key="3"
        aria-label="Accordion 3"
        title="Le stationnement est-il disponible ?"
        className="bg-primary-50 text-primary-800 text-sm text-start" // Réduit la taille du texte et le padding
      >
        {Content3}
      </AccordionItem>
      <AccordionItem
        key="4"
        aria-label="Accordion 4"
        title="Quels sont vos horaires d'ouverture ?"
        className="bg-primary-50 text-primary-800 text-sm text-start" // Réduit la taille du texte et le padding
      >
        {Content4}
      </AccordionItem>
    </Accordion>
  );
}
