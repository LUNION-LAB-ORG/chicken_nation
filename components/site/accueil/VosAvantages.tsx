import type { IConfigFidelite } from "@/features/fidelite/fidelite.api";
import type { IPromotionPublique } from "@/features/promotion/promotion.type";

import Image from "../Image";
import { BadgesStores } from "../BadgesStores";
import { LienBouton } from "../Bouton";
import { Niveau } from "../Etiquettes";
import { Icone, type NomIcone } from "../Icone";
import { RangeeDefilante } from "../RangeeDefilante";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { chiffresPoints, reglesPoints, texteNiveaux } from "./avantages.textes";
import { OffresDuMoment } from "./OffresDuMoment";
import styles from "./VosAvantages.module.css";

import { INSECABLE } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** Pastille jaune d'une tuile (icône du sprite). */
function PastilleIcone({ nom }: { nom: NomIcone }) {
  return (
    <span className={styles.icone}>
      <Icone nom={nom} />
    </span>
  );
}

/**
 * Carte de la Nation dessinée en CSS, comme sur le site actuel, aux couleurs
 * du niveau Standard (décor : le texte à côté la décrit).
 */
function CarteDessinee() {
  return (
    <div aria-hidden="true" className={styles.carte}>
      <div className={styles.carteFace}>
        <span className={styles.carteLogo}>
          <Image
            alt=""
            height={36}
            src="/assets/site/logo-orange.png"
            width={24}
          />
        </span>
        <span className={styles.cartePuce} />
        <span className={cn("font-affiche", styles.carteTitre)}>
          Carte de la Nation
        </span>
        <span className={styles.carteNiveau}>Niveau Standard</span>
        <span className={styles.carteNumero}>
          •••• {new Date().getFullYear()}
        </span>
      </div>
    </div>
  );
}

/**
 * « Vos avantages » (maquette, HTML 226-288, CSS 708-799, retouche 2) :
 * chiffres-clés et règles des points, Gratte et Gagne, Carte de la Nation
 * avec « Demander ma carte », niveaux, Combo Mystère, parrainage, offres du
 * moment, puis le bandeau jaune vers l'application. Tous les chiffres
 * viennent de `GET /fidelity/loyalty/config` (valeurs de production du 03/10
 * si l'API ne répond pas). Ancre `#avantages` (navigation de l'en-tête).
 */
export function VosAvantages({
  config,
  offres,
}: {
  config: IConfigFidelite;
  offres: readonly IPromotionPublique[];
}) {
  return (
    <Section
      motif
      className={styles.avantages}
      espacement="aucun"
      fond="encre"
      id="avantages"
      titreId="avantages-titre"
    >
      <div className={styles.haut}>
        <div className="min-w-0">
          <TitreAffiche className="text-jaune" id="avantages-titre">
            Vos avantages
          </TitreAffiche>
          <p className={styles.intro}>
            Chaque commande payée en ligne, sur le site ou dans
            l&apos;application, vous rapporte des points et une carte à gratter.
          </p>
          <ul className={styles.chiffres}>
            {chiffresPoints(config).map((c) => (
              <li key={c.texte}>
                <b>{c.fort}</b>
                <span>{c.texte}</span>
              </li>
            ))}
          </ul>
          <p className={styles.regles}>{reglesPoints(config)}</p>
          <div className={cn(styles.tuile, styles.gratte)}>
            <PastilleIcone nom="gratter" />
            <h3>Gratte et Gagne</h3>
            <p>
              Après chaque commande payée en ligne, une carte à gratter vous
              attend dans l&apos;application. Elle révèle vos points et cache
              parfois un cadeau (plat, boisson, accompagnement ou bon
              d&apos;achat), surtout sur les plus grosses commandes. Le cadeau
              s&apos;utilise dans l&apos;application ou sur le site, avant sa
              date limite.
            </p>
          </div>
        </div>
        <div className={styles.nation} id="carte-nation">
          <CarteDessinee />
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
            <div>
              <LienBouton href="/fr/carte-nation/adhesion">
                Demander ma carte
              </LienBouton>
            </div>
          </div>
        </div>
      </div>
      <RangeeDefilante
        as="ul"
        className={styles.tuiles}
        colonnes={3}
        libelle="Autres avantages"
      >
        <li className={styles.tuile}>
          <PastilleIcone nom="couronne" />
          <h3>VIP et VVIP</h3>
          <p>
            {texteNiveaux(config)} Le niveau repart de zéro chaque 1
            <sup>er</sup>
            {INSECABLE}janvier.
          </p>
          <p className={styles.niveaux}>
            <Niveau niveau="standard" />
            <Niveau niveau="vip" />
            <Niveau niveau="vvip" />
          </p>
        </li>
        <li className={styles.tuile}>
          <PastilleIcone nom="mystere" />
          <h3>Combo Mystère</h3>
          <p>
            Quand une partie est ouverte, devinez dans l&apos;application la
            combinaison secrète du menu grâce aux indices, en 3 essais. Tirage
            au sort parmi les bonnes réponses{INSECABLE}: le gagnant reçoit un
            plat ou un supplément offert. Sans achat.
          </p>
        </li>
        <li className={styles.tuile}>
          <PastilleIcone nom="amis" />
          <h3>Parrainage</h3>
          <p>
            Partagez votre code depuis l&apos;application. Votre ami reçoit un
            cadeau de bienvenue à gratter, et vous êtes récompensé quand il
            l&apos;utilise sur une commande payée en ligne. Conditions dans
            l&apos;application.
          </p>
        </li>
      </RangeeDefilante>
      <OffresDuMoment offres={offres} />
      <div className={styles.appli}>
        <p>
          <strong>
            Le grattage, le Combo Mystère et le parrainage se font dans
            l&apos;application.
          </strong>{" "}
          Même compte et même numéro que sur le site.
        </p>
        <BadgesStores />
      </div>
    </Section>
  );
}
