import Section from "@/components/primitives/Section";
import {
  ListOrderedIcon,
  MapPinIcon,
  ShoppingBagIcon,
  StarIcon,
  StoreIcon,
  TruckIcon,
} from "lucide-react";

const features = [
  {
    name: "Livraison Express",
    description: "Moins de 30 minutes de la cuisine à votre porte.",
    icon: <TruckIcon className="h-6 w-6" />,
  },
  {
    name: "Qualité Garantie",
    description: "Le goût du vrai poulet croustillant, délicieux jusqu'à l'os.",
    icon: <StarIcon className="h-6 w-6" />,
  },
  {
    name: "Commande Mobile",
    description:
      "Passez commande et suivez-la en temps réel via l'application.",
    icon: <ShoppingBagIcon className="h-6 w-6" />,
  },
  {
    name: "Modes de Réception",
    description: "Livraison, à emporter ou sur place (dine-in).",
    icon: <ListOrderedIcon className="h-6 w-6" />,
  },
  {
    name: "Nos Restaurants",
    description: "Marcory Zone 4, Angré et Sococe. Ouvert 10h à 23h.",
    icon: <MapPinIcon className="h-6 w-6" />,
  },
  {
    name: "Promotions & Fidélité",
    description: "Offres exclusives et cumul de points via l'application.",
    icon: <StoreIcon className="h-6 w-6" />,
  },
];

export function Features() {
  return (
    <Section
      id="features"
      title="Des fonctionnalités"
      subtitle="Tout ce qu'il faut pour vous régaler sans effort."
      className="max-w-screen-lg mx-auto container px-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center gap-6">
        {features.map(({ name, description, icon: Icon }, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden bg-card p-6 flex flex-col items-center text-center"
          >
            <div className="flex flex-col items-center gap-y-4 mb-4">
              <div className="bg-gradient-to-b from-primary to-primary/80 p-2 rounded-lg text-white">
                {Icon}
              </div>
              <h2 className="text-xl font-semibold text-card-foreground">
                {name}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            {/* <Link href="#" className="text-sm text-primary hover:underline">
              Learn more &gt;
            </Link> */}
          </div>
        ))}
      </div>
    </Section>
  );
}
