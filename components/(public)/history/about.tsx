import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";
import Motion from "@/lib/motion";
import Image from "next/image";

export default function About() {
  return (
    <Section className="flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
      <Motion variant="horizontalSlideIn" animationParams={{ offset: -60 }}>
        <Image
          src="/assets/images/illustrations/histoire/seau.png"
          alt="Chicken Nation - histoire"
          width={1214 / 2}
          height={986 / 2}
          className="object-contain drop-shadow-lg"
          priority
        />
      </Motion>

      <Motion variant="horizontalSlideIn" animationParams={{ offset: 60 }}>
        <div className="flex flex-col gap-6 max-w-2xl text-center lg:text-left">
          <Title size="md" className="text-center lg:text-start">
            A PROPOS DE NOUS
          </Title>

          <div className="text-base lg:text-lg leading-relaxed text-gray-800 flex flex-col gap-4">
            <p>
              <span className="font-bold">
                Chicken Nation, le champion du poulet !
              </span>{" "}
              Ici, on ne rigole pas avec la qualité.
            </p>

            <p>
              <span className="font-bold">Notre secret ?</span> Un poulet 100 %
              local, élevé dans nos propres fermes, nourri avec soin et préparé
              avec passion. Du frais, du bon, du champion !
            </p>

            <p>
              <span className="font-bold">Et en cuisine ?</span> Là, c&apos;est
              du sérieux ! On le marine avec amour, on l&apos;enrobe d&apos;une
              panure dorée et croustillante, puis on le frit jusqu&apos;à la
              perfection pour un équilibre parfait entre tendre et croquant.
            </p>

            <p className="text-primary font-bold">
              Explosion de saveurs garantie à chaque bouchée !
            </p>

            <p>
              Un goût authentique, généreux et unique,{" "}
              <span className="font-bold">made in Côte d&apos;Ivoire.</span>
            </p>

            <p>
              Installez-vous, régalez-vous et laissez-vous embarquer dans une
              expérience poulet incomparable !
            </p>

            <p className="font-bold text-primary">
              Chicken Nation — Du bon. Du frais. Du champion !
            </p>
          </div>
        </div>
      </Motion>
    </Section>
  );
}
