import type { ReactNode } from "react";
import type { IConfigFidelite } from "@/features/fidelite/fidelite.api";

import Image from "next/image";

import { Ancre } from "../Ancre";
import { Ruban } from "../Autocollants";
import { BlocAvis } from "../avis/BlocAvis";
import { BadgesStores } from "../BadgesStores";
import { LienBouton } from "../Bouton";
import NationCardVisual from "../carte-nation/NationCardVisual";
import { Niveau } from "../Etiquettes";
import { Icone, type NomIcone } from "../Icone";
import { QrAppli } from "../QrAppli";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { BlocAppli } from "./BlocAppli";
import styles from "./PageAppli.module.css";

import { fcfa, INSECABLE, nombre } from "@/lib/typo";

/** Écrans de l'application (cadre de téléphone détouré, 281 × 500). */
const ECRANS = [
  {
    src: "/assets/site/appli-accueil.png",
    alt: "Écran d'accueil de l'application Chicken Nation",
    sizes: "(min-width: 900px) 230px, 34vw",
  },
  {
    src: "/assets/site/appli-plat.png",
    alt: "Fiche d'un plat dans l'application, avec son prix",
    sizes: "(min-width: 900px) 270px, 40vw",
  },
  {
    src: "/assets/site/appli-commande.png",
    alt: "Commande réussie dans l'application",
    sizes: "(min-width: 900px) 230px, 34vw",
  },
] as const;

/** Une tuile : icône, titre, texte (et un complément facultatif). */
function Tuile({
  icone,
  titre,
  children,
}: {
  icone: NomIcone;
  titre: string;
  children: ReactNode;
}) {
  return (
    <li className={styles.tuile}>
      <span className={styles.icone}>
        <Icone className="size-6" nom={icone} />
      </span>
      <h3>{titre}</h3>
      {children}
    </li>
  );
}

/**
 * Page « L'application Chicken Nation » : en-tête avec les écrans de l'appli
 * et les badges des stores, ce qu'on fait dans l'application (faits de la
 * retouche 2, chiffres de fidélité lus dans l'API), la Carte de la Nation,
 * les avis clients et le bloc de téléchargement. Composant serveur.
 */
export function PageAppli({
  fidelite,
  avis,
}: {
  fidelite: IConfigFidelite;
  avis: readonly ICommentaire[];
}) {
  return (
    <>
      <Section
        motif
        className={styles.tete}
        classeConteneur={styles.teteGrille}
        espacement="aucun"
        fond="orange"
        titreId="titre-appli-page"
      >
        <div className={styles.teteTexte}>
          <Ruban>Android et iPhone</Ruban>
          <h1 className={styles.titre} id="titre-appli-page">
            L<span className={styles.apostrophe}>’</span>application Chicken
            Nation
          </h1>
          <p className={styles.intro}>
            Commandez, suivez votre livraison, grattez vos cartes Gratte et
            Gagne et jouez au Combo Mystère. Le même compte et le même numéro
            que sur le site.
          </p>
          <div className={styles.telecharger}>
            <QrAppli className={styles.qr} />
            <BadgesStores pile />
          </div>
          <p className={styles.lienSite}>
            Pas envie d&apos;installer l&apos;application{INSECABLE}?{" "}
            <Ancre href="/fr/carte">Commandez sur le site</Ancre>
          </p>
        </div>
        <div className={styles.telephones}>
          {ECRANS.map((ecran) => (
            <div key={ecran.src} className={styles.telephone}>
              <Image
                alt={ecran.alt}
                height={500}
                loading="eager"
                sizes={ecran.sizes}
                src={ecran.src}
                width={281}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        motif
        fond="surface"
        id="dans-l-application"
        titreId="titre-dans-l-application"
      >
        <div className="mb-[22px] grid gap-2 lg:mb-[30px]">
          <TitreAffiche id="titre-dans-l-application">
            Commander, suivre, gagner
          </TitreAffiche>
          <p className="max-w-[40em] text-encre-doux">
            Tout ce que vous faites dans l&apos;application Chicken Nation, avec
            le même compte que sur le site.
          </p>
        </div>

        <ul className={styles.tuiles}>
          <Tuile icone="panier" titre="Commander">
            <p>
              Choisissez vos plats, personnalisez votre menu et passez commande
              en quelques secondes{INSECABLE}: en livraison, à emporter ou sur
              place.
            </p>
          </Tuile>
          <Tuile icone="scooter" titre="Suivre votre commande">
            <p>
              Suivez votre commande pas à pas, de la cuisine jusqu&apos;à votre
              porte.
            </p>
          </Tuile>
          <Tuile icone="etoile" titre="Points et niveaux">
            <p>
              Chaque commande payée en ligne rapporte 1{INSECABLE}point par
              tranche de {fcfa(fidelite.tranche)} de plats. 1{INSECABLE}point
              vaut {fcfa(fidelite.valeurPoint)} de réduction, dès{" "}
              {nombre(fidelite.minimumPoints)}
              {INSECABLE}points. VIP à {nombre(fidelite.seuilVip)}
              {INSECABLE}points gagnés dans l&apos;année, VVIP à{" "}
              {nombre(fidelite.seuilVvip)}.
            </p>
            <p className="flex flex-wrap gap-1.5">
              <Niveau niveau="standard" />
              <Niveau niveau="vip" />
              <Niveau niveau="vvip" />
            </p>
          </Tuile>
          <Tuile icone="gratter" titre="Gratte et Gagne">
            <p>
              Après chaque commande payée en ligne, une carte à gratter vous
              attend dans l&apos;application. Elle révèle vos points et cache
              parfois un cadeau (plat, boisson, accompagnement ou bon
              d&apos;achat), surtout sur les plus grosses commandes.
            </p>
          </Tuile>
          <Tuile icone="mystere" titre="Combo Mystère">
            <p>
              Quand une partie est ouverte, devinez la combinaison secrète du
              menu grâce aux indices, en 3{INSECABLE}essais. Tirage au sort
              parmi les bonnes réponses{INSECABLE}: le gagnant reçoit un plat ou
              un supplément offert. Sans achat.
            </p>
          </Tuile>
          <Tuile icone="amis" titre="Parrainage">
            <p>
              Partagez votre code depuis l&apos;application. Votre ami reçoit un
              cadeau de bienvenue à gratter, et vous êtes récompensé quand il
              l&apos;utilise sur une commande payée en ligne. Conditions dans
              l&apos;application.
            </p>
          </Tuile>
        </ul>

        <div className={styles.nation}>
          <NationCardVisual
            cardLabel="Carte de la Nation"
            className={styles.nationCarte}
            memberLabel="Niveau Standard"
          />
          <div className={styles.nationTexte}>
            <h3>Carte de la Nation</h3>
            <p>
              Votre carte de membre, gratuite et ouverte à tous, aux couleurs de
              votre niveau. Demandez-la sur le site ou dans l&apos;application
              {INSECABLE}: l&apos;équipe la valide, vous êtes prévenu par
              notification et sur WhatsApp, puis vous la retrouvez dans
              l&apos;application.
            </p>
            <p className={styles.note}>
              Étudiant{INSECABLE}? Une case facultative permet de le préciser
              dans la demande.
            </p>
            <LienBouton className="mt-1" href="/fr/carte-nation/adhesion">
              Demander ma carte
            </LienBouton>
          </div>
        </div>
      </Section>

      <BlocAvis avis={avis} />
      <BlocAppli />
    </>
  );
}
