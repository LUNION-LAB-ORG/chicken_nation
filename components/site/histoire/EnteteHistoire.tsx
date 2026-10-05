import Image from "next/image";

import { Eclat, Tampon } from "../Autocollants";
import { LienBouton } from "../Bouton";
import { Conteneur } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { INSECABLE } from "@/lib/typo";

/**
 * En-tête de Notre histoire : photo de la salle (fond de l'ancienne page
 * Franchise) sous un voile sombre, titre jaune et accès direct à la section
 * franchise (maquette, CSS 893-903, en-tête d'écran sur photo).
 */
export function EnteteHistoire() {
  return (
    <section
      aria-labelledby="titre-histoire"
      className="relative isolate flex min-h-[260px] items-end overflow-hidden bg-encre pt-8 pb-7 text-white [--focus:var(--color-jaune)] md:min-h-[clamp(300px,32vw,440px)] md:pt-10 md:pb-9"
    >
      {/* Seule image préchargée de la page : 25 ko. */}
      <Image
        fill
        preload
        alt=""
        className="-z-20 object-cover object-[50%_40%]"
        sizes="100vw"
        src="/assets/site/fond-salle.webp"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(20,11,5,0.2)_0%,rgba(20,11,5,0.62)_50%,rgba(20,11,5,0.84)_100%)]"
      />
      <Conteneur className="flex flex-wrap items-end justify-between gap-x-7 gap-y-4">
        <div className="grid max-w-[40em] min-w-0 gap-3">
          <TitreAffiche
            className="text-jaune [text-shadow:3px_3px_0_var(--color-encre)]"
            id="titre-histoire"
            niveau="h1"
            taille="ecran"
          >
            Notre histoire
          </TitreAffiche>
          <p className="max-w-[34em] text-base font-medium md:text-[17px]">
            Née de la passion du poulet de qualité, Chicken Nation sert à
            Abidjan un poulet 100{INSECABLE}% local et 100{INSECABLE}% halal,
            dans ses restaurants et en livraison.
          </p>
          <div className="mt-1 flex flex-wrap gap-3">
            <LienBouton href="#franchise" iconeFin="fleche">
              Devenir franchisé
            </LienBouton>
            <LienBouton href="/fr/carte" variante="secondaire">
              Voir la carte
            </LienBouton>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="hidden items-center gap-[18px] pr-2 lg:flex"
        >
          <Tampon fort={`100${INSECABLE}%`} texte="Halal" />
          <Eclat fort={`100${INSECABLE}%`} texte="Local" />
        </div>
      </Conteneur>
    </section>
  );
}
