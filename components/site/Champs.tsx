import type { ComponentPropsWithRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/* Champs de formulaire (maquette, CSS 1308-1327). Utilisables avec
   react-hook-form : {...register("nom")} passe aussi la référence (React 19). */

const classeSaisie =
  "w-full min-w-0 rounded-xl border-[1.5px] border-trait-fort bg-white px-3.5 text-base text-encre placeholder:text-encre-doux/80 focus:border-encre focus-visible:outline-offset-1 aria-invalid:border-rouge disabled:cursor-not-allowed disabled:bg-surface disabled:text-encre-doux";

type Commun = {
  id: string;
  label: ReactNode;
  /** Aide sous le champ (format attendu). */
  aide?: ReactNode;
  /** Message d'erreur : bordure rouge, lu aussitôt (role=alert). */
  erreur?: string | null;
  /** Classe du bloc entier. */
  classeBloc?: string;
};

/** Ids lus par aria-describedby : aide, erreur et ceux déjà donnés. */
function decritPar(
  id: string,
  aide: ReactNode,
  erreur: string | null | undefined,
  deja?: string,
) {
  return (
    [deja, aide ? `${id}-aide` : null, erreur ? `${id}-erreur` : null]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

function Bloc({
  id,
  label,
  aide,
  erreur,
  classeBloc,
  children,
}: Commun & { children: ReactNode }) {
  return (
    <div className={cn("grid min-w-0 gap-1.5", classeBloc)}>
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      {children}
      {erreur ? (
        <p
          className="text-[13px] font-semibold text-rouge"
          id={`${id}-erreur`}
          role="alert"
        >
          {erreur}
        </p>
      ) : null}
      {aide ? (
        <p
          className="text-[13px] leading-[1.45] text-encre-doux"
          id={`${id}-aide`}
        >
          {aide}
        </p>
      ) : null}
    </div>
  );
}

/** Champ de saisie d'une ligne. `prefixe` affiche un indicatif collé (« +225 »). */
export function ChampTexte({
  id,
  label,
  aide,
  erreur,
  classeBloc,
  prefixe,
  className,
  "aria-describedby": deja,
  ...props
}: Commun & { prefixe?: string } & Omit<ComponentPropsWithRef<"input">, "id">) {
  const champ = (
    <input
      aria-describedby={decritPar(id, aide, erreur, deja)}
      aria-invalid={erreur ? true : undefined}
      className={cn(
        classeSaisie,
        "min-h-12",
        prefixe && "rounded-l-none tracking-[0.04em]",
        className,
      )}
      id={id}
      {...props}
    />
  );

  return (
    <Bloc
      aide={aide}
      classeBloc={classeBloc}
      erreur={erreur}
      id={id}
      label={label}
    >
      {prefixe ? (
        <div className="flex items-stretch">
          <span className="inline-grid shrink-0 place-items-center rounded-l-xl border-[1.5px] border-r-0 border-trait-fort bg-surface px-3 text-[15px] font-semibold">
            {prefixe}
          </span>
          {champ}
        </div>
      ) : (
        champ
      )}
    </Bloc>
  );
}

/** Zone de texte sur plusieurs lignes (message de contact). */
export function ChampZoneTexte({
  id,
  label,
  aide,
  erreur,
  classeBloc,
  className,
  "aria-describedby": deja,
  ...props
}: Commun & Omit<ComponentPropsWithRef<"textarea">, "id">) {
  return (
    <Bloc
      aide={aide}
      classeBloc={classeBloc}
      erreur={erreur}
      id={id}
      label={label}
    >
      <textarea
        aria-describedby={decritPar(id, aide, erreur, deja)}
        aria-invalid={erreur ? true : undefined}
        className={cn(classeSaisie, "min-h-[76px] resize-y py-2.5", className)}
        id={id}
        {...props}
      />
    </Bloc>
  );
}

/** Liste déroulante native (clavier, lecteurs d'écran et téléphones sans effort). */
export function ChampSelection({
  id,
  label,
  aide,
  erreur,
  classeBloc,
  className,
  children,
  "aria-describedby": deja,
  ...props
}: Commun & Omit<ComponentPropsWithRef<"select">, "id">) {
  return (
    <Bloc
      aide={aide}
      classeBloc={classeBloc}
      erreur={erreur}
      id={id}
      label={label}
    >
      <select
        aria-describedby={decritPar(id, aide, erreur, deja)}
        aria-invalid={erreur ? true : undefined}
        className={cn(classeSaisie, "min-h-12", className)}
        id={id}
        {...props}
      >
        {children}
      </select>
    </Bloc>
  );
}
