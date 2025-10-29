import Section from "@/components/primitives/Section";
import { siteConfig } from "@/lib/config";
import { IconMoneybag } from "@tabler/icons-react";
import { CardSim, ListOrdered, PanelsRightBottomIcon, TrashIcon } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Commande rapide",
    description:
      "Choisissez vos plats, personnalisez votre menu et passez commande en quelques secondes.",
    imageSrc: "/assets/images/devices/Device-2.png",
    direction: "rtl" as const,
    icon: <ListOrdered className="h-10 w-10" />,
  },
  {
    title: "Modes de réception flexibles",
    description:
      "Faites-vous livrer, mangez sur place ou commandez à emporter selon votre envie du moment.",
    imageSrc: "/assets/images/devices/Device-3.png",
    direction: "ltr" as const,
    icon: <CardSim className="h-10 w-10" />,
  },
  {
    title: "Paiement simplifié",
    description: "Payez en ligne ou à la réception, en toute sécurité.",
    imageSrc: "/assets/images/devices/Device-4.png",
    direction: "rtl" as const,
    icon: <IconMoneybag className="h-10 w-10" />,
  },
  {
    title: "Suivi en temps réel",
    description:
      "Suivez votre commande pas à pas, de la cuisine jusqu'à votre porte.",
    imageSrc: "/assets/images/devices/Device-5.png",
    direction: "ltr" as const,
    icon: <TrashIcon className="h-10 w-10" />,
  },
  {
    title: "Promotions & fidélité",
    description:
      "Profitez d'offres exclusives et cumulez des points à chaque commande.",
    imageSrc: "/assets/images/devices/Device-6.png",
    direction: "rtl" as const,
    icon: <PanelsRightBottomIcon className="h-10 w-10" />,
  },
];

export function Features() {
  return (
    <Section
      id="features"
      title="Features"
      subtitle="Powerful features"
      className="max-w-screen-lg mx-auto container px-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center gap-6">
        {features.map(({ title, description, icon: Icon }, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden bg-card p-6 flex flex-col items-center text-center"
          >
            <div className="flex flex-col items-center gap-y-4 mb-4">
              <div className="bg-gradient-to-b from-primary to-primary/80 p-2 rounded-lg text-white">
                {Icon}
              </div>
              <h2 className="text-xl font-semibold text-card-foreground">
                {title}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            <Link href="#" className="text-sm text-primary hover:underline">
              Learn more &gt;
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}
