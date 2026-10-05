import Image from "next/image";

import { BadgesStores } from "../BadgesStores";
import { QrAppli } from "../QrAppli";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import styles from "./BlocAppli.module.css";

import { TELEPHONE, telLien } from "@/lib/typo";
import { cn } from "@/lib/utils";

/**
 * « La Nation dans votre poche » (accueil, page Application) : QR code vers
 * le choix du store (masqué sous 720 px), badges officiels empilés, numéro
 * unique et l'illustration du livreur collée en bas à droite.
 */
export function BlocAppli({
  id = "application",
  className,
}: {
  id?: string;
  className?: string;
}) {
  const titreId = `${id}-titre`;

  return (
    <Section
      className={cn(styles.appli, className)}
      classeConteneur={styles.interieur}
      espacement="aucun"
      fond="jaune-appli"
      id={id}
      titreId={titreId}
    >
      <div className={styles.texte}>
        <TitreAffiche id={titreId} taille="appli">
          La Nation dans votre poche
        </TitreAffiche>
        <p>
          Le même compte que sur le site. Suivez vos commandes, retrouvez vos
          points, grattez vos cartes Gratte et Gagne et jouez au Combo Mystère.
        </p>
        <div className={styles.telecharger}>
          <QrAppli className={styles.qr} />
          <BadgesStores pile />
        </div>
        <p className={styles.tel}>
          Ou commandez par téléphone au <a href={telLien()}>{TELEPHONE}</a>
        </p>
      </div>
      <div className={styles.visuel}>
        <Image
          alt="Livreur Chicken Nation à scooter, et une main qui tient un téléphone ouvert sur l'application"
          height={957}
          sizes="(min-width: 720px) 60vw, 100vw"
          src="/assets/site/fond-livreur.webp"
          width={1400}
        />
      </div>
    </Section>
  );
}
