import type { ComponentPropsWithRef, ReactNode } from "react";

import styles from "./Choix.module.css";

import { cn } from "@/lib/utils";

type ChoixProps = Omit<ComponentPropsWithRef<"input">, "type" | "id"> & {
  id: string;
  label: ReactNode;
  /** Précision sous le libellé (« 2 sauces au choix »). */
  detail?: ReactNode;
  /** Prix à droite (« + 500 FCFA » ou « Inclus »). */
  prix?: ReactNode;
  /** Prix affiché en discret (« Inclus »). */
  inclus?: boolean;
  /** Forme en pilule, pour les choix courts. */
  pilule?: boolean;
  classeBloc?: string;
};

function Choix({
  type,
  id,
  label,
  detail,
  prix,
  inclus,
  pilule,
  classeBloc,
  ...props
}: ChoixProps & { type: "checkbox" | "radio" }) {
  return (
    <div className={cn(styles.choix, pilule && styles.pilule, classeBloc)}>
      <input id={id} type={type} {...props} />
      <label htmlFor={id}>
        <span className={styles.texte}>
          <b>{label}</b>
          {detail ? <small>{detail}</small> : null}
        </span>
        {prix ? (
          <span className={cn(styles.prix, inclus && styles.inclus)}>
            {prix}
          </span>
        ) : null}
      </label>
    </div>
  );
}

/** Case à cocher en carte (suppléments, options). */
export function CaseACocher(props: ChoixProps) {
  return <Choix type="checkbox" {...props} />;
}

/** Bouton radio en carte (choix du menu, moyen de paiement). Les radios d'un groupe partagent leur `name`. */
export function ChoixRadio(props: ChoixProps) {
  return <Choix type="radio" {...props} />;
}

/**
 * Groupe de choix (fieldset + legend) : titre, précision à droite (« Obligatoire »),
 * erreur lue aussitôt. `pilules` aligne des choix courts sur une ligne.
 */
export function GroupeChoix({
  legende,
  precision,
  requis,
  erreur,
  idErreur,
  pilules,
  colonnes,
  className,
  children,
}: {
  legende: ReactNode;
  precision?: ReactNode;
  /** Précision en orange (choix obligatoire). */
  requis?: boolean;
  erreur?: string | null;
  /** id du message d'erreur (à relier depuis les champs si besoin). */
  idErreur?: string;
  pilules?: boolean;
  /** Deux colonnes à partir de 760 px (fiche plat). */
  colonnes?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset
      aria-describedby={erreur ? idErreur : undefined}
      className={cn(
        "grid min-w-0 gap-2.5",
        erreur && styles.enErreur,
        className,
      )}
    >
      <legend className="mb-2.5 flex w-full flex-wrap items-baseline justify-between gap-x-2.5 gap-y-0.5 text-base font-bold">
        <span>{legende}</span>
        {precision ? (
          <small
            className={cn(
              "text-[12.5px] font-medium text-encre-doux",
              requis && "font-semibold text-orange-texte",
            )}
          >
            {precision}
          </small>
        ) : null}
      </legend>
      <div
        className={cn(
          pilules ? "flex flex-wrap gap-2" : "grid gap-2",
          !pilules && colonnes && "min-[760px]:grid-cols-2",
        )}
      >
        {children}
      </div>
      {erreur ? (
        <p
          className="text-[13px] font-semibold text-rouge"
          id={idErreur}
          role="alert"
        >
          {erreur}
        </p>
      ) : null}
    </fieldset>
  );
}
