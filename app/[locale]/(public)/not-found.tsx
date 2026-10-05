import type { Metadata } from "next";

import { Surtitre } from "@/components/site/Autocollants";
import { LienBouton } from "@/components/site/Bouton";
import { Section } from "@/components/site/Section";
import { TitreAffiche } from "@/components/site/TitreAffiche";
import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

// Next ajoute lui-même `noindex` à toute réponse 404.
export const metadata: Metadata = {
  title: "Page introuvable",
};

/**
 * Page 404 des pages publiques, avec l'en-tête et le pied de page. Elle sert
 * aux adresses inconnues (reprise telle quelle par app/global-not-found.tsx)
 * et à tout notFound() appelé par une page.
 */
export default function PageIntrouvable() {
  return (
    <Section
      motif
      className="flex flex-1 items-center"
      classeConteneur="max-w-2xl py-6 text-center lg:py-10"
      fond="surface"
      titreId="titre-introuvable"
    >
      <Surtitre>Erreur 404</Surtitre>
      <TitreAffiche
        className="mt-3"
        id="titre-introuvable"
        niveau="h1"
        taille="compacte"
      >
        Page introuvable
      </TitreAffiche>
      <p className="mx-auto mt-4 max-w-[34em] text-encre-doux">
        Cette adresse ne mène à aucune page. Elle a peut-être changé, ou le lien
        contient une erreur.
      </p>
      <nav
        aria-label="Pages utiles"
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        <LienBouton href="/fr/carte" iconeFin="fleche">
          Voir la carte
        </LienBouton>
        <LienBouton href="/fr/restaurants" variante="secondaire">
          Nos restaurants
        </LienBouton>
        <LienBouton href="/fr" variante="secondaire">
          Retour à l&apos;accueil
        </LienBouton>
      </nav>
      <p className="mt-8 text-sm text-encre-doux">
        Une question{INSECABLE}? Appelez-nous au{" "}
        <a
          className="font-semibold whitespace-nowrap text-orange-texte underline underline-offset-[3px] hover:text-encre"
          href={telLien()}
        >
          {TELEPHONE}
        </a>
        .
      </p>
    </Section>
  );
}
