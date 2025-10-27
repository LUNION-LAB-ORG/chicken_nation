import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";
import Motion from "@/lib/motion";
import Image from "next/image";

export default function Asset() {
  return (
    <Section className="flex flex-col gap-8 md:gap-12">
      <Motion variant="verticalSlideIn">
        <Title size="md">NOS ATOUTS</Title>
      </Motion>
      <div className="flex flex-col-reverse md:flex-row-reverse justify-between gap-4">
        <Motion
          variant="horizontalSlideIn"
          animationParams={{ delay: 0.4, offset: 50 }}
        >
          <Image
            src="/assets/images/illustrations/histoire/histoire-5.png"
            alt="histoire-3"
            width={1280 / 2.5}
            height={990 / 2.5}
            objectFit="contain"
            className="rounded-lg"
          />
        </Motion>
        <Motion
          variant="horizontalSlideIn"
          animationParams={{ delay: 0.4, offset: -50 }}
        >
          <div className="flex flex-col justify-around gap-8">
            <div className="flex flex-col gap-4">
              <div className="text-primary text-lg md:text-2xl font-semibold">
                Une Cuisine Authentique
              </div>
              <div>
                Chez CHICKEN NATION, tout commence bien avant la cuisine.
                <br /> De l&apost;élevage au service, nous maîtrisons chaque
                étape pour garantir un poulet
                <br />
                de qualité supérieure, élevé dans les meilleures conditions.
                <br />
                Cette maîtrise totale de la chaîne nous permet de vous offrir un
                goût unique,
                <br />
                constant, et surtout… authentique.
                <br /> <br />
                👉 Quand vous croquez dans notre poulet,
                <br />
                vous croquez dans un vrai savoir-faire local.
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-primary text-lg md:text-2xl font-semibold">
                Innovation Constante
              </div>
              <div>
                Nous sommes constamment à l&apos;écoute de vos retours pour
                améliorer <br /> nos services et créer de nouvelles recettes qui
                répondent à vos <br /> envies.
              </div>
            </div>
          </div>
        </Motion>
      </div>
    </Section>
  );
}
