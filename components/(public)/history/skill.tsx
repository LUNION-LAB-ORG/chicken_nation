import Image from "next/image";
import { Link } from "@/i18n/navigation";
import Motion from "@/lib/motion";
import Title from "@/components/primitives/Title";
import Section from "@/components/primitives/Section";

export default function Skill() {
  return (
    <Section className="flex flex-col gap-8 md:gap-12">
      <Motion variant="verticalSlideIn">
        <Title size="md">
          {/* Le trait d'union manque à la police des titres : police normale pour lui seul. */}
          NOTRE <span className="block sm:inline">SAVOIR<span className="font-sans">-</span>FAIRE</span>
        </Title>
      </Motion>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Motion variant="horizontalSlideIn" animationParams={{ offset: -50 }}>
          <div className="flex flex-col justify-between gap-8">
            <div className="flex flex-col gap-4">
              <div className="text-primary text-lg md:text-2xl font-semibold">
                Une Cuisine Authentique
              </div>
              <div>
                Tous nos plats sont préparés sur place, à la commande. Nos{" "}
                <br />
                recettes, développées par notre chef, mêlent tradition et
                innovation <br /> pour vous offrir une expérience gustative
                unique.
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-primary text-lg md:text-2xl font-semibold">
                Innovation Constante
              </div>
              <div>
                Nous sommes constamment à l&apos;écoute de vos retours pour
                améliorer <br />
                nos services et créer de nouvelles recettes qui répondent à vos{" "}
                <br />
                envies.
              </div>
            </div>
            {/* Ce bouton ne menait nulle part et disparaissait sur téléphone.
                Composant serveur : un Link mis en forme, pas de Button as={Link}. */}
            <Link
              href="/restaurants/nos-menus"
              className="w-fit self-start rounded-xl bg-primary px-8 py-3 font-semibold text-white"
            >
              Commander en ligne
            </Link>
          </div>
        </Motion>
        <Motion variant="horizontalSlideIn" animationParams={{ offset: 50 }}>
          <Image
            src="/assets/images/illustrations/histoire/s-faire.png"
            alt="histoire-3"
            width={984 / 1.5}
            height={570 / 1.5}
            objectFit="contain"
            className="rounded-lg"
          />
        </Motion>
      </div>
    </Section>
  );
}
