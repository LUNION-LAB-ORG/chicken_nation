import Image from "../Image";
import { BordDechire } from "../BordDechire";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

/**
 * Nos atouts (ancienne page Histoire) : la maîtrise de toute la chaîne,
 * de l'élevage au service. Aplat sombre, seau détouré, bord déchiré jaune
 * qui ouvre la section franchise.
 */
export function Atouts() {
  return (
    <Section
      motif
      className="pt-12 pb-[calc(max(100px,7.2vw)+8px)] lg:pt-16"
      espacement="aucun"
      fond="encre"
      id="atouts"
      titreId="atouts-titre"
    >
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
        <div className="grid min-w-0 gap-4">
          <TitreAffiche className="text-jaune" id="atouts-titre">
            Nos atouts
          </TitreAffiche>
          <h3 className="text-lg leading-[1.25] font-bold">
            De l&apos;élevage au service
          </h3>
          <p className="max-w-[38em] text-sur-encre-doux">
            Chez Chicken Nation, tout commence bien avant la cuisine. De
            l&apos;élevage au service, nous maîtrisons chaque étape pour
            garantir un poulet de qualité supérieure, élevé dans les meilleures
            conditions. Cette maîtrise de toute la chaîne nous permet de vous
            offrir un goût unique, constant et authentique.
          </p>
          <p className="mt-2 max-w-[24em] border-l-4 border-jaune pl-4 text-[clamp(19px,2.6vw,24px)] leading-[1.3] font-extrabold">
            Quand vous croquez dans notre poulet, vous croquez dans un vrai
            savoir-faire local.
          </p>
        </div>
        <Image
          alt=""
          className="mx-auto block h-auto w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[460px]"
          height={975}
          sizes="(min-width: 900px) 460px, (min-width: 600px) 380px, 300px"
          src="/assets/site/histoire-seau.webp"
          width={1200}
        />
      </div>
      <BordDechire inverse couleur="jaune" />
    </Section>
  );
}
