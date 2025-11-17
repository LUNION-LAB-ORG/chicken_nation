import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";
import Motion from "@/lib/motion";
import Image from "next/image";

export default function Commitment() {
  const commitments = [
    {
      id: 1,
      title: "Assistance Opérationnelle",
      iconUrl: "/assets/images/illustrations/franchise/picture-1.png",
      items: [
        "Visites régulières",
        "Audits qualité",
        "Optimisation des performances",
        "Résolution des problèmes",
      ],
    },
    {
      id: 2,
      title: "Support Marketing",
      iconUrl: "/assets/images/illustrations/franchise/picture-2.png",
      items: [
        "Kit de communication",
        "Campagnes nationales",
        "Supports publicitaires",
        "Stratégie digitale",
      ],
    },
    {
      id: 3,
      title: "Support Administratif",
      iconUrl: "/assets/images/illustrations/franchise/picture-3.png",
      items: [
        "Aide à la gestion",
        "Reporting",
        "Optimisation des coûts",
        "Conseil juridique",
      ],
    },
  ];

  return (
    <Section className="bg-orange-50 space-y-8">
      <Motion variant="verticalSlideIn">
        <Title size="md" color="foreground">
          NOS ENGAGEMENTS
        </Title>
      </Motion>

      <Motion variant="verticalSlideIn">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {commitments.map((commitment) => (
            <div key={commitment.id} className="flex flex-col items-center">
              {/* Image Section */}
              <div className="mb-4">
                <Image
                  src={commitment.iconUrl}
                  alt={`${commitment.title} icon`}
                  width={64}
                  height={64} // Taille adaptée pour les icônes
                  className="w-16 h-16"
                />
              </div>

              <h2 className="text-xl font-bold text-primary-500 mb-4">
                {commitment.title}
              </h2>

              <ul className="space-y-0">
                {commitment.items.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Motion>
    </Section>
  );
}
