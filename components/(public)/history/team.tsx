import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";
import Motion from "@/lib/motion";
import Image from "next/image";

export default function Team() {
  return (
    <Section className="flex flex-col gap-8 md:gap-12">
      <Motion variant="verticalSlideIn">
        <Title size="md">NOTRE EQUIPE</Title>
      </Motion>
      <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-4">
        <Motion variant="verticalSlideIn">
          <Image
            src="/assets/images/illustrations/histoire/team.png"
            alt="histoire-4"
            width={4032 / 7}
            height={3024 / 7}
            objectFit="contain"
            className="rounded-lg"
          />
        </Motion>
        <Motion className="h-full" variant="verticalSlideIn">
          <div className="flex flex-col min-h-[400px] justify-between gap-8">
            <div className="flex flex-col gap-4">
              <div className="text-primary text-xl md:text-2xl font-semibold">
                Une Famille Passionnée
              </div>
              <div className="text-base md:text-lg">
                Derrière chaque burger et chaque plat, se cache une famille
                <br /> qui travaille main dans la main pour vous procurer <br />{" "}
                satisfaction à chaque visite.
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-primary text-xl md:text-2xl font-semibold">
                Formation Continue
              </div>
              <div className="text-base md:text-lg">
                Nous investissons dans la formation régulière de notre personnel{" "}
                <br /> pour maintenir un niveau d&apos;excellence constant.
                Chaque membre de <br /> notre équipe est un expert dans son
                domaine.
              </div>
            </div>
          </div>
        </Motion>
      </div>
    </Section>
  );
}
