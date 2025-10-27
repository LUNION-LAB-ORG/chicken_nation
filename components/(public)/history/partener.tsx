import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";
import Motion from "@/lib/motion";
import Image from "next/image";

const serviceItems = [
  {
    id: 1,
    name: "TURBO",
    picture: "assets/images/illustrations/histoire/partenaire-1.png",
  },
  {
    id: 2,
    name: "GLOVO",
    picture: "assets/images/illustrations/histoire/partenaire-3.png",
  },
  {
    id: 3,
    name: "YANGO DELIVERY",
    picture: "assets/images/illustrations/histoire/partenaire-4.png",
  },
];

export default function Partner() {
  return (
    <Section className="bg-primary/10 flex flex-col justify-center gap-6">
      <Motion variant="verticalSlideIn">
        <Title size="md">NOS PARTENAIRES</Title>
      </Motion>
      <Motion variant="verticalSlideIn">
        <div className="relative flex flex-row justify-center md:justify-evenly text-center gap-2 md:gap-6 items-center">
          {serviceItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col p-4 justify-between items-center gap-4 rounded-2xl"
            >
              <div className="relative w-20 h-20 md:w-30 md:h-30">
                <Image
                  src={`/${item.picture}`}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
              <div>{item.name}</div>
            </div>
          ))}
        </div>
      </Motion>
    </Section>
  );
}
