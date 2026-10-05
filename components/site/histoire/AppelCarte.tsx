import { LienBouton } from "../Bouton";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { TELEPHONE, telLien } from "@/lib/typo";

/** Appel final de Notre histoire : vers la carte, ou par téléphone. */
export function AppelCarte() {
  return (
    <Section
      className="pt-4 pb-12 lg:pt-6 lg:pb-16"
      classeConteneur="grid max-w-3xl justify-items-center gap-4 text-center"
      espacement="aucun"
      id="commander"
      titreId="commander-titre"
    >
      <TitreAffiche id="commander-titre">Votre poulet vous attend</TitreAffiche>
      <p className="max-w-[32em] text-encre-doux">
        Livraison dans le Grand Abidjan ou retrait dans l&apos;un de nos
        restaurants.
      </p>
      <LienBouton
        className="mt-1"
        href="/fr/carte"
        iconeFin="fleche"
        taille="grand"
        variante="sombre"
      >
        Voir la carte et commander
      </LienBouton>
      <p className="text-sm text-encre-doux">
        Ou par téléphone au{" "}
        <a
          className="font-bold whitespace-nowrap text-encre no-underline hover:underline hover:underline-offset-[3px]"
          href={telLien()}
        >
          {TELEPHONE}
        </a>
      </p>
    </Section>
  );
}
