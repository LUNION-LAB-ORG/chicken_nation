import Image from "../Image";
import { Surtitre } from "../Autocollants";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

/**
 * Notre équipe (ancienne page Histoire) : la photo de l'équipe avec la
 * mascotte, ramenée de 11,2 Mo à 96 ko (public/assets/site/histoire-equipe.webp).
 */
export function Equipe() {
  return (
    <Section motif fond="surface" id="equipe" titreId="equipe-titre">
      <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="grid min-w-0 gap-4">
          <Surtitre>Notre équipe</Surtitre>
          <TitreAffiche id="equipe-titre">Main dans la main</TitreAffiche>
          <div className="grid max-w-[36em] gap-5">
            <div className="grid gap-1.5">
              <h3 className="text-lg leading-[1.25] font-bold">
                Une famille passionnée
              </h3>
              <p>
                Derrière chaque burger et chaque plat se cache une famille qui
                travaille main dans la main pour vous satisfaire à chaque
                visite.
              </p>
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-lg leading-[1.25] font-bold">
                Formation continue
              </h3>
              <p>
                Nous formons régulièrement notre personnel pour garder un niveau
                d&apos;excellence constant. Chaque membre de notre équipe est un
                expert dans son domaine.
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[560px] lg:max-w-none lg:rotate-[1.5deg]">
          <div className="overflow-hidden rounded-panneau border-[6px] border-white bg-creme shadow-photo max-[419px]:border-4">
            <Image
              alt="L'équipe Chicken Nation en tenue orange, avec la mascotte Champion dans poulet, dans un de nos restaurants"
              className="block aspect-[4/3] h-auto w-full object-cover"
              height={900}
              sizes="(min-width: 1264px) 544px, (min-width: 900px) 45vw, (min-width: 592px) 560px, calc(100vw - 32px)"
              src="/assets/site/histoire-equipe.webp"
              width={1200}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
