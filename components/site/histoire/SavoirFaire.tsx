import Image from "next/image";

import { Surtitre } from "../Autocollants";
import { LienBouton } from "../Bouton";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

/**
 * Notre savoir-faire (ancienne page Histoire) : la cuisine sur place et
 * l'écoute des clients, avec le dessin du burger et de la canette.
 * Le trait d'union manque à la police d'affiche : « Notre savoir-faire »
 * reste en surtitre, en police normale.
 */
export function SavoirFaire() {
  return (
    <Section id="savoir-faire" titreId="savoir-faire-titre">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
        <div className="grid min-w-0 gap-4 lg:order-2">
          <Surtitre>Notre savoir-faire</Surtitre>
          <TitreAffiche id="savoir-faire-titre">
            Tout se fait sur place
          </TitreAffiche>
          <div className="grid max-w-[36em] gap-5">
            <div className="grid gap-1.5">
              <h3 className="text-lg leading-[1.25] font-bold">
                Une cuisine authentique
              </h3>
              <p>
                Tous nos plats sont préparés sur place, à la commande. Nos
                recettes, développées par notre chef, mêlent tradition et
                innovation pour vous offrir une expérience gustative unique.
              </p>
            </div>
            <div className="grid gap-1.5">
              <h3 className="text-lg leading-[1.25] font-bold">
                Innovation constante
              </h3>
              <p>
                Nous sommes à l&apos;écoute de vos retours pour améliorer nos
                services et créer de nouvelles recettes qui répondent à vos
                envies.
              </p>
            </div>
          </div>
          <div className="mt-1">
            <LienBouton href="/fr/carte" iconeFin="fleche">
              Commander en ligne
            </LienBouton>
          </div>
        </div>
        <Image
          alt="Dessin d'un burger au poulet pané, de frites et d'une canette sur une nappe étoilée"
          className="mx-auto block h-auto w-full max-w-[520px] lg:order-1"
          height={570}
          sizes="(min-width: 900px) 520px, (min-width: 552px) 520px, calc(100vw - 32px)"
          src="/assets/site/histoire-savoir-faire.webp"
          width={984}
        />
      </div>
    </Section>
  );
}
