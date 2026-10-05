import type { ReactNode } from "react";

import { Ancre } from "../Ancre";
import { Icone } from "../Icone";
import { LienFleche } from "../Lien";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { FormulaireContact } from "./FormulaireContact";

import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

const EMAIL = "info@chicken-nation.com";

/** Enveloppe au trait (absente du jeu d'icônes du site), couleur du texte. */
function IconeEnveloppe() {
  return (
    <svg
      aria-hidden="true"
      className="block size-[22px]"
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/** Une ligne des coordonnées : pastille jaune, intitulé, contenu. */
function Coordonnee({
  icone,
  intitule,
  children,
}: {
  icone: ReactNode;
  intitule: string;
  children: ReactNode;
}) {
  return (
    <li className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)] items-start gap-3.5 rounded-carte border border-trait bg-white p-4">
      <span className="grid size-11 place-items-center rounded-full bg-jaune text-encre">
        {icone}
      </span>
      <div className="grid min-w-0 gap-1">
        <h3 className="text-[13px] font-bold tracking-[0.06em] text-encre-doux uppercase">
          {intitule}
        </h3>
        {children}
      </div>
    </li>
  );
}

/**
 * Contenu de la page Contact : le seul numéro publié (27 21 71 21 30),
 * l'adresse électronique, le siège, et le formulaire partagé avec la section
 * franchise de Notre histoire (objet du courriel « Message du site »).
 */
export function PageContact() {
  return (
    <>
      <Section
        motif
        className="pt-7 pb-6 md:pt-9 md:pb-8"
        espacement="aucun"
        fond="jaune"
        titreId="titre-contact"
      >
        <TitreAffiche id="titre-contact" niveau="h1" taille="compacte">
          Nous contacter
        </TitreAffiche>
        <p className="mt-2 max-w-[34em] text-base font-medium">
          Une question, une suggestion ou une réclamation{INSECABLE}? Nous
          aimons avoir de vos nouvelles.
        </p>
      </Section>

      <Section titreId="coordonnees-titre">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
          <div className="grid min-w-0 content-start gap-4">
            <h2
              className="text-[clamp(21px,3vw,26px)] leading-[1.2] font-extrabold"
              id="coordonnees-titre"
            >
              Nos coordonnées
            </h2>
            <ul className="grid list-none gap-3">
              <Coordonnee
                icone={<Icone className="size-[22px]" nom="telephone" />}
                intitule="Téléphone"
              >
                <a
                  className="inline-flex min-h-11 w-fit items-center text-[clamp(22px,6vw,26px)] leading-[1.15] font-extrabold whitespace-nowrap text-encre no-underline hover:underline hover:underline-offset-4"
                  href={telLien()}
                >
                  {TELEPHONE}
                </a>
                <p className="text-sm text-encre-doux">
                  Commandes par téléphone, 7{INSECABLE}jours sur 7.
                </p>
              </Coordonnee>
              <Coordonnee
                icone={<IconeEnveloppe />}
                intitule="Adresse électronique"
              >
                {/* Coupure permise après « @ » seulement, jamais au trait d'union. */}
                <a
                  className="inline-flex min-h-11 w-fit items-center text-base font-semibold text-orange-texte underline underline-offset-[3px] hover:text-encre"
                  href={`mailto:${EMAIL}`}
                >
                  <span>
                    info@
                    <wbr />
                    <span className="whitespace-nowrap">
                      chicken-nation.com
                    </span>
                  </span>
                </a>
              </Coordonnee>
              <Coordonnee
                icone={<Icone className="size-[22px]" nom="repere" />}
                intitule="Siège"
              >
                <p>
                  Angré 8<sup>e</sup> tranche, face à la station Shell, Abidjan,
                  Côte d&apos;Ivoire
                </p>
                <p>Marcory Zone{INSECABLE}4</p>
                <LienFleche
                  className="-mb-2 whitespace-normal"
                  href="/fr/restaurants"
                >
                  Nos restaurants et leurs horaires
                </LienFleche>
              </Coordonnee>
              <Coordonnee
                icone={<Icone className="size-[22px]" nom="panier" />}
                intitule="Commander"
              >
                <p>
                  En ligne, en livraison ou à retirer au restaurant, ou au{" "}
                  <a
                    className="font-semibold whitespace-nowrap text-encre underline underline-offset-[3px]"
                    href={telLien()}
                  >
                    {TELEPHONE}
                  </a>
                  .
                </p>
                <LienFleche className="-mb-2" href="/fr/carte">
                  Voir la carte
                </LienFleche>
              </Coordonnee>
            </ul>
            <p className="text-sm text-encre-doux">
              Une question sur une commande ou sur l&apos;application{INSECABLE}
              ? Consultez aussi la{" "}
              <Ancre
                className="font-semibold text-orange-texte underline underline-offset-[3px] hover:text-encre"
                href="/fr/faq"
              >
                FAQ
              </Ancre>
              .
            </p>
          </div>

          <div className="grid min-w-0 content-start gap-4 rounded-panneau border border-trait bg-surface p-5 md:p-7">
            <h2
              className="text-[clamp(21px,3vw,26px)] leading-[1.2] font-extrabold"
              id="ecrire-titre"
            >
              Écrivez-nous
            </h2>
            <FormulaireContact sujet="contact" titreId="ecrire-titre" />
          </div>
        </div>
      </Section>
    </>
  );
}
