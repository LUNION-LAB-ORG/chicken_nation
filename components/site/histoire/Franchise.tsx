import { Surtitre } from "../Autocollants";
import { BordDechire } from "../BordDechire";
import { FormulaireContact } from "../formulaires/FormulaireContact";
import { Icone, type NomIcone } from "../Icone";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

/**
 * « Pourquoi nous rejoindre ? » : les trois listes de l'ancienne page
 * Franchise, sans rien y ajouter (anglicismes remplacés).
 */
export const RAISONS: readonly { titre: string; points: readonly string[] }[] =
  [
    {
      titre: "Un concept éprouvé",
      points: [
        "Modèle économique rentable",
        "Marque reconnue et appréciée",
        "Processus opérationnels optimisés",
        "Formation complète assurée",
      ],
    },
    {
      titre: "Des avantages concurrentiels",
      points: [
        "Recettes exclusives",
        "Produits de qualité supérieure",
        "Fournisseurs référencés",
        "Outils numériques innovants",
      ],
    },
    {
      titre: "Un accompagnement total",
      points: [
        `Formation initiale de 6${INSECABLE}semaines`,
        "Accompagnement continu à l'ouverture",
        "Assistance personnalisée en communication",
        "Suivi opérationnel régulier",
      ],
    },
  ];

/** « Nos engagements » de l'ancienne page Franchise, avec les icônes du site. */
export const ENGAGEMENTS: readonly {
  titre: string;
  icone: NomIcone;
  points: readonly string[];
}[] = [
  {
    titre: "Assistance opérationnelle",
    icone: "viseur",
    points: [
      "Visites régulières",
      "Audits qualité",
      "Optimisation des performances",
      "Résolution des problèmes",
    ],
  },
  {
    titre: "Communication et publicité",
    icone: "etiquette",
    points: [
      "Outils de communication",
      "Campagnes nationales",
      "Supports publicitaires",
      "Stratégie numérique",
    ],
  },
  {
    titre: "Soutien administratif",
    icone: "coche",
    points: [
      "Aide à la gestion",
      "Rapports d'activité",
      "Optimisation des coûts",
      "Conseil juridique",
    ],
  },
];

const titreBloc = "text-[clamp(21px,3vw,26px)] leading-[1.2] font-extrabold";

/**
 * Devenir franchisé (`#franchise`, cible de l'ancienne adresse /fr/franchise) :
 * pourquoi nous rejoindre, nos engagements, puis la demande de franchise,
 * envoyée avec l'objet « Demande de franchise », ou le 27 21 71 21 30.
 */
export function Franchise() {
  return (
    <Section
      motif
      className="pt-12 pb-[calc(max(100px,7.2vw)+8px)] lg:pt-16"
      espacement="aucun"
      fond="jaune"
      id="franchise"
      titreId="franchise-titre"
    >
      <div className="grid max-w-[44em] gap-3">
        <Surtitre className="text-encre">Devenir franchisé</Surtitre>
        <TitreAffiche id="franchise-titre">
          La franchise Chicken Nation
        </TitreAffiche>
        <p className="text-base font-medium md:text-[17px]">
          Devenez franchisé et rejoignez l&apos;aventure Chicken Nation
          {INSECABLE}: une belle réussite, en pleine croissance.
        </p>
      </div>

      <h3 className={`${titreBloc} mt-9`}>
        Pourquoi nous rejoindre{INSECABLE}?
      </h3>
      <ul className="mt-4 grid list-none gap-3 md:grid-cols-3 md:gap-4">
        {RAISONS.map((raison) => (
          <li
            key={raison.titre}
            className="grid content-start gap-3 rounded-carte bg-white p-5 shadow-1"
          >
            <h4 className="text-[17px] leading-[1.25] font-bold">
              {raison.titre}
            </h4>
            <ul className="grid list-none gap-2 text-[15px]">
              {raison.points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <Icone
                    className="mt-[3px] size-[18px] text-orange-texte"
                    nom="coche"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <h3 className={`${titreBloc} mt-10`}>Nos engagements</h3>
      <ul className="mt-4 grid list-none gap-3 md:grid-cols-3 md:gap-4">
        {ENGAGEMENTS.map((engagement) => (
          <li
            key={engagement.titre}
            className="grid content-start gap-3 rounded-carte border border-trait-sombre bg-encre p-5 text-white"
          >
            <span className="grid size-11 place-items-center rounded-full bg-jaune text-encre">
              <Icone className="size-6" nom={engagement.icone} />
            </span>
            <h4 className="text-[17px] leading-[1.25] font-bold">
              {engagement.titre}
            </h4>
            <ul className="grid list-none gap-1.5 text-sm text-sur-encre-doux">
              {engagement.points.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-[9px] size-1.5 shrink-0 rounded-full bg-jaune"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-6 rounded-panneau bg-white p-5 shadow-1 md:p-7 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10 lg:p-9">
        <div className="grid min-w-0 content-start gap-3">
          <h3 className={titreBloc} id="franchise-demande">
            Demande de franchise
          </h3>
          <p className="text-encre-doux">
            Présentez-vous et décrivez votre projet en quelques lignes. Notre
            équipe reviendra vers vous.
          </p>
          <div className="mt-2 flex items-center gap-3 rounded-carte bg-surface p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-jaune text-encre">
              <Icone className="size-[22px]" nom="telephone" />
            </span>
            <p className="grid min-w-0 leading-[1.2]">
              <span className="text-[13px] text-encre-doux">
                Vous préférez appeler{INSECABLE}?
              </span>
              <a
                className="inline-flex min-h-11 w-fit items-center text-[22px] font-extrabold whitespace-nowrap text-encre no-underline hover:underline hover:underline-offset-4"
                href={telLien()}
              >
                {TELEPHONE}
              </a>
            </p>
          </div>
        </div>
        <FormulaireContact sujet="franchise" titreId="franchise-demande" />
      </div>
      <BordDechire />
    </Section>
  );
}
