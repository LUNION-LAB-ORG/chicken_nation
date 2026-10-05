import type { IPlatDetail } from "@/features/commande/types/commande.types";
import type {
  ICategorieCarte,
  IPlatCarte,
} from "@/features/menus/types/carte.types";
import type { CSSProperties } from "react";

import { Ancre } from "../Ancre";
import { BadgePromo } from "../Autocollants";
import { Tag } from "../Etiquettes";
import { Icone } from "../Icone";
import { LienFleche } from "../Lien";
import { PhotoPlat } from "../PhotoPlat";
import { Conteneur, Section } from "../Section";

import { BoutonCommanderPlat } from "./BoutonCommanderPlat";
import { BoutonPartager } from "./BoutonPartager";
import { CompositionPlat } from "./CompositionPlat";
import styles from "./Carte.module.css";
import { DisponibiliteHoraire } from "./DisponibiliteHoraire";
import { GrillePlats } from "./SectionCategorie";
import { descriptionLisible } from "./textes-plat";

import { mentionModes } from "@/features/commande/utils/panier.utils";
import { CHEMIN_CARTE } from "@/lib/seo/commun";
import { INSECABLE, TELEPHONE, fcfa, nombre, telLien } from "@/lib/typo";

/** Nombre de plats proposés sous « Autres plats de la catégorie » (une rangée à 1 280 px). */
const AUTRES_MAX = 4;

// Lien dans une phrase : souligné orange, contraste suffisant sur le papier.
const LIEN_TEXTE =
  "font-semibold text-orange-texte underline decoration-[1.5px] underline-offset-[3px] hover:text-encre";

/** Vendu seulement à table (ni livraison ni retrait) : rien à commander en ligne. */
export const servieSeulementSurPlace = (plat: Pick<IPlatCarte, "modes">) =>
  plat.modes.length > 0 &&
  !plat.modes.includes("DELIVERY") &&
  !plat.modes.includes("PICKUP");

/** « À emporter uniquement » (mention de la fiche), ou `null` pour un plat vendu partout. */
export function mentionPlat(plat: Pick<IPlatCarte, "modes">) {
  const mention = mentionModes(plat.modes);

  return mention
    ? mention.charAt(0).toLocaleUpperCase("fr") + mention.slice(1)
    : null;
}

/** Largeur affichée de la photo dès 900 px : la colonne (544 px au plus), ou moins pour une photo haute. */
const largeurPhoto = (ratio: number) =>
  Math.round(Math.min(544, 440 * (ratio > 0 ? ratio : 1)));

/** Fil d'Ariane visible ; le même est publié en JSON-LD par la page. */
function FilAriane({ plat }: { plat: IPlatCarte }) {
  const etapes = [
    { nom: "Accueil", href: "/fr" },
    { nom: "La carte", href: CHEMIN_CARTE },
    { nom: plat.categorie.nom, href: `${CHEMIN_CARTE}#${plat.categorie.cle}` },
  ];

  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-[13px] text-encre-doux">
        {etapes.map((e) => (
          <li key={e.href} className="flex items-center gap-1.5">
            <Ancre
              className="inline-flex min-h-11 items-center text-encre-doux underline-offset-[3px] hover:text-encre hover:underline"
              href={e.href}
            >
              {e.nom}
            </Ancre>
            <Icone className="size-3.5 opacity-60" nom="droite" />
          </li>
        ))}
        <li
          aria-current="page"
          className="flex min-h-11 min-w-0 items-center font-semibold text-encre"
        >
          <span className="truncate">{plat.nom}</span>
        </li>
      </ol>
    </nav>
  );
}

/** Prix payé en grand, et prix barré lu « Au lieu de … » pour un plat en promotion. */
function PrixDetail({ plat }: { plat: IPlatCarte }) {
  return (
    <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 leading-[1.2] tabular-nums">
      {plat.prixAvantPromo !== null ? (
        <>
          <strong className="rounded-lg bg-jaune px-2 py-0.5 text-[26px] font-extrabold whitespace-nowrap">
            {fcfa(plat.prix)}
          </strong>
          <s className="text-base whitespace-nowrap text-encre-doux">
            <span className="sr-only">Au lieu de </span>
            {fcfa(plat.prixAvantPromo)}
          </s>
        </>
      ) : (
        <strong className="text-[26px] font-extrabold whitespace-nowrap">
          {fcfa(plat.prix)}
        </strong>
      )}
    </p>
  );
}

/** Où et comment le plat se commande, avec un lien vers les restaurants. */
function Modes({ plat }: { plat: IPlatCarte }) {
  const restaurants = (
    <Ancre className={LIEN_TEXTE} href="/fr/restaurants">
      nos restaurants
    </Ancre>
  );

  if (servieSeulementSurPlace(plat))
    return <>Servi seulement à table, dans {restaurants}.</>;
  if (plat.modes.length > 0 && !plat.modes.includes("DELIVERY"))
    return <>À retirer dans l&apos;un de {restaurants}.</>;
  if (plat.modes.length > 0 && !plat.modes.includes("PICKUP"))
    return <>Livraison dans le Grand Abidjan.</>;

  return (
    <>
      Livraison dans le Grand Abidjan ou retrait dans l&apos;un de {restaurants}
      .
    </>
  );
}

/**
 * Page d'un plat (plan, section 3.4) : fil d'Ariane, photo entière à sa
 * taille, catégorie (lien vers sa section de la carte), nom en h1 (Poppins,
 * jamais la police d'affiche : les noms viennent de la base), mention des
 * modes, description, prix, créneau, « Choisir et commander » (fiche plat),
 * « Partager », composition et choix (épicé, sauces, suppléments), puis les
 * autres plats de la catégorie. Composant serveur ;
 * les boutons sont des îlots.
 */
export function PagePlat({
  plat,
  categorie,
  detail = null,
}: {
  plat: IPlatCarte;
  /** Section de la carte qui porte la catégorie du plat (autres plats). */
  categorie: ICategorieCarte | null;
  /** Détail public du plat (composition écrite dans la page), ou null. */
  detail?: IPlatDetail | null;
}) {
  const remise =
    plat.prixAvantPromo !== null ? plat.prixAvantPromo - plat.prix : 0;
  const description = plat.description
    ? descriptionLisible(plat.description)
    : "";
  const mention = mentionPlat(plat);
  const surPlace = servieSeulementSurPlace(plat);
  const autres = (categorie?.plats ?? [])
    .filter((p) => p.id !== plat.id)
    .slice(0, AUTRES_MAX);

  return (
    <>
      <Conteneur className="pt-2 pb-12 lg:pb-16">
        <FilAriane plat={plat} />
        <article
          aria-labelledby="titre-plat"
          className="mt-2 grid items-start gap-6 lg:mt-4 lg:grid-cols-2 lg:gap-12"
        >
          <PhotoPlat
            preload
            alt={plat.nom}
            className={styles.photo}
            etiquette={plat.photo.etiquette}
            fond={plat.photo.fond}
            sizes={`(min-width: 900px) ${largeurPhoto(plat.photo.ratio)}px, (min-width: 720px) calc(100vw - 64px), calc(100vw - 32px)`}
            src={plat.photo.src}
            style={
              { "--ratio": String(plat.photo.ratio || 1) } as CSSProperties
            }
          >
            {remise > 0 ? (
              <BadgePromo className="top-3 left-3 text-sm">
                −{nombre(remise)}
                {INSECABLE}FCFA
              </BadgePromo>
            ) : null}
          </PhotoPlat>
          <div className="min-w-0 lg:pt-2">
            <Ancre
              className="inline-flex min-h-11 items-center text-[13px] font-bold tracking-[0.08em] text-orange-texte uppercase underline-offset-[3px] hover:text-encre hover:underline"
              href={`${CHEMIN_CARTE}#${plat.categorie.cle}`}
            >
              {plat.categorie.nom}
            </Ancre>
            <h1
              className="text-[clamp(26px,5vw,40px)] leading-[1.1] font-extrabold tracking-tight [overflow-wrap:anywhere]"
              id="titre-plat"
            >
              {plat.nom}
            </h1>
            {mention ? (
              <Tag className="mt-3" genre={surPlace ? "neutre" : "emporter"}>
                {mention}
              </Tag>
            ) : null}
            {description ? (
              <p className="mt-3 max-w-[38em] text-[15px] leading-[1.6] text-encre-doux">
                {description}
              </p>
            ) : null}
            <PrixDetail plat={plat} />
            {plat.creneau ? (
              <DisponibiliteHoraire className="mt-3" creneau={plat.creneau} />
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <BoutonCommanderPlat
                className="max-sm:w-full"
                plat={plat}
                surPlaceSeulement={surPlace}
              />
              <BoutonPartager
                className="max-sm:w-full"
                texte={`${plat.nom}, ${fcfa(plat.prix)} chez Chicken Nation`}
                titre={plat.nom}
              />
            </div>
            <p className="mt-5 text-sm leading-[1.6] text-encre-doux">
              <Modes plat={plat} /> Une question{INSECABLE}? Appelez le{" "}
              <a className={`${LIEN_TEXTE} whitespace-nowrap`} href={telLien()}>
                {TELEPHONE}
              </a>
              .
            </p>
            <CompositionPlat detail={detail} />
          </div>
        </article>
      </Conteneur>
      {autres.length > 0 && categorie ? (
        <Section fond="surface" titreId="titre-autres">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
            <h2
              className="text-[clamp(20px,3vw,26px)] leading-[1.2] font-bold"
              id="titre-autres"
            >
              Autres plats de la catégorie
            </h2>
            <LienFleche href={`${CHEMIN_CARTE}#${categorie.cle}`}>
              Voir toute la catégorie
            </LienFleche>
          </div>
          <GrillePlats plats={autres} />
        </Section>
      ) : null}
    </>
  );
}
