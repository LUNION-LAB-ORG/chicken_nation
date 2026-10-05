import type { ReactNode } from "react";

import { Section } from "./Section";
import styles from "./TexteLong.module.css";
import { TitreAffiche } from "./TitreAffiche";

import { estTexteAffiche } from "@/lib/typo";
import { cn } from "@/lib/utils";

/**
 * Pages secondaires (FAQ, conditions, confidentialité, suppression du compte) :
 * en-tête d'écran compact (maquette, CSS 881-890) puis texte long à la
 * typographie soignée. Composants serveur, sans JavaScript.
 */

const FONDS_ENTETE = {
  /** Orange étoilé (« Mes commandes » de la maquette). */
  orange: "bg-orange [background-image:var(--motif-clair)] text-encre",
  /** Jaune étoilé (« Suivi de commande » de la maquette). */
  jaune: "bg-jaune [background-image:var(--motif-sombre)] text-encre",
} as const;

type FondEntete = keyof typeof FONDS_ENTETE;

/** Colonne des textes longs : 52 em au plus, gouttières comprises. */
export const COLONNE_TEXTE = "max-w-[calc(52rem+2*var(--gouttiere))]";

// Titre blanc ombré d'encre sur l'orange, encre sur le jaune.
const COULEURS_TITRE: Record<FondEntete, string> = {
  orange: "text-white [text-shadow:3px_3px_0_var(--color-encre)]",
  jaune: "text-encre",
};

/**
 * h1 de la page. Police d'affiche quand le texte s'y prête ; sinon (accent,
 * apostrophe) Poppins 800 à une taille qui garde le plus long mot sur une
 * ligne à 320 px. Jamais de lettre de repli au milieu d'un mot.
 */
export function TitrePage({
  id,
  fond = "orange",
  className,
  children,
}: {
  id: string;
  /** Fond de l'en-tête, qui décide de la couleur du titre. */
  fond?: FondEntete;
  className?: string;
  children: string;
}) {
  const classes = cn(COULEURS_TITRE[fond], className);

  if (estTexteAffiche(children)) {
    return (
      <TitreAffiche className={classes} id={id} niveau="h1" taille="compacte">
        {children}
      </TitreAffiche>
    );
  }

  return (
    <h1
      className={cn(
        "font-texte text-[clamp(26px,6vw,48px)] leading-[1.08] font-extrabold tracking-tight text-balance uppercase [overflow-wrap:anywhere]",
        classes,
      )}
      id={id}
    >
      {children}
    </h1>
  );
}

/**
 * En-tête d'écran compact : surtitre, h1, phrase d'introduction. Le titre
 * porte l'id `titreId` (aria-labelledby de la section).
 */
export function EntetePage({
  titre,
  surtitre,
  titreId = "titre-page",
  fond = "orange",
  etroit,
  children,
}: {
  titre: string;
  surtitre?: ReactNode;
  titreId?: string;
  fond?: FondEntete;
  /** Aligné sur la colonne d'un texte long plutôt que sur la page entière. */
  etroit?: boolean;
  /** Introduction sous le titre. */
  children?: ReactNode;
}) {
  return (
    <Section
      className={cn(
        "[background-size:72px_72px] bg-repeat pt-[26px] pb-6 lg:pt-9 lg:pb-8",
        FONDS_ENTETE[fond],
      )}
      classeConteneur={etroit ? COLONNE_TEXTE : undefined}
      espacement="aucun"
      titreId={titreId}
    >
      {surtitre ? (
        <p className="mb-2 text-[13px] font-bold tracking-[0.08em] uppercase">
          {surtitre}
        </p>
      ) : null}
      <TitrePage fond={fond} id={titreId}>
        {titre}
      </TitrePage>
      {children ? (
        <div className="mt-2.5 max-w-[38em] text-[15px] font-medium md:text-base">
          {children}
        </div>
      ) : null}
    </Section>
  );
}

/**
 * Texte long (conditions, confidentialité) : colonne de 52 em au plus,
 * intertitres, listes et liens stylés par le module CSS. Le contenu garde ses
 * balises sémantiques (h2, h3, p, ul, ol).
 */
export function TexteLong({
  titre,
  surtitre,
  titreId,
  fondEntete,
  intro,
  miseAJour,
  children,
}: {
  titre: string;
  surtitre?: ReactNode;
  titreId?: string;
  fondEntete?: FondEntete;
  intro?: ReactNode;
  /** Mention de bas de page (« Dernière mise à jour : … »). */
  miseAJour?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <EntetePage
        etroit
        fond={fondEntete}
        surtitre={surtitre}
        titre={titre}
        titreId={titreId}
      >
        {intro}
      </EntetePage>
      {/* Sans nom : l'en-tête porte déjà le titre de la page, deux régions
          du même nom gênaient les lecteurs d'écran (axe, landmark-unique). */}
      <Section classeConteneur={COLONNE_TEXTE}>
        <div className={styles.texte}>{children}</div>
        {miseAJour ? (
          <p className="mt-10 border-t border-trait pt-4 text-[13px] text-encre-doux">
            {miseAJour}
          </p>
        ) : null}
      </Section>
    </>
  );
}

const ENCADRES = {
  /** Avertissement (action définitive) : titre rouge. */
  alerte: { bloc: "border-rouge/30 bg-rouge-fond", titre: "text-rouge" },
  /** Information ou aide. */
  info: { bloc: "border-trait bg-surface", titre: "text-encre" },
} as const;

/** Encadré dans un texte long : titre facultatif, puis le contenu. */
export function Encadre({
  genre = "info",
  titre,
  niveauTitre = "h2",
  className,
  children,
}: {
  genre?: keyof typeof ENCADRES;
  titre?: string;
  niveauTitre?: "h2" | "h3";
  className?: string;
  children: ReactNode;
}) {
  const Titre = niveauTitre;

  return (
    <div
      className={cn(
        "rounded-carte border px-4 py-3.5 md:px-5 md:py-4",
        ENCADRES[genre].bloc,
        styles.encadre,
        className,
      )}
    >
      {titre ? (
        <Titre className={cn("text-[16.5px] font-bold", ENCADRES[genre].titre)}>
          {titre}
        </Titre>
      ) : null}
      {children}
    </div>
  );
}
