import type { Ref } from "react";

import { cn } from "@/lib/utils";

/**
 * Grand titre des écrans de « Ton avis compte », en capitales.
 * La police d'affiche (Balbeer Rustic) n'a ni É, ni Ê, ni apostrophe, ni
 * « ! » : cinq titres sur six en contiennent. Tous sont donc rendus dans le
 * style de repli de TitreAffiche (Poppins 800, capitales, mêmes tailles),
 * pour un parcours homogène, et écrits correctement, jamais désaccentués.
 * Blanc à ombre portée sur l'aplat orange, comme les en-têtes de la commande.
 */
export function TitreAvis({
  children,
  id,
  ref,
  className,
}: {
  children: string;
  id: string;
  /** Le titre reçoit le focus à chaque changement d'écran. */
  ref?: Ref<HTMLHeadingElement>;
  className?: string;
}) {
  return (
    <h1
      ref={ref}
      className={cn(
        "font-texte text-[clamp(30px,5vw,52px)] leading-[1.02] font-extrabold tracking-tight text-balance text-white uppercase [font-synthesis:none] [text-shadow:3px_3px_0_var(--color-encre)]",
        className,
      )}
      id={id}
      tabIndex={-1}
    >
      {children}
    </h1>
  );
}
