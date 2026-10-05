import { tv } from "tailwind-variants";

import { estTexteAffiche } from "@/lib/typo";

const styleTitre = tv({
  base: "leading-[0.95] font-normal uppercase [font-synthesis:none] text-balance",
  variants: {
    taille: {
      /** Titre de section (CSS 103) */
      section: "text-[clamp(32px,6vw,58px)]",
      /** En-tête d'écran : carte, caisse (CSS 883) */
      ecran: "text-[clamp(46px,9vw,92px)]",
      /** En-tête d'écran compact (CSS 888) */
      compacte: "text-[clamp(34px,5vw,60px)]",
      /** Bloc Application (CSS 825) */
      appli: "text-[clamp(32px,5vw,52px)]",
      /** Tête du panier (CSS 965) */
      panneau: "text-[34px] leading-none",
    },
    affichable: {
      true: "font-affiche",
      /** Repli : la police d'affiche n'a pas ce caractère. */
      false: "font-texte font-extrabold tracking-tight",
    },
  },
  defaultVariants: { taille: "section", affichable: true },
});

type TitreAfficheProps = {
  /**
   * Texte FIXE écrit dans le code, en A-Z a-z 0-9 espace , . seulement
   * (Balbeer Rustic n'a ni É ni À). Jamais un nom venu de l'API.
   */
  children: string;
  niveau?: "h1" | "h2" | "h3" | "p";
  taille?: keyof typeof styleTitre.variants.taille;
  id?: string;
  /** -1 pour recevoir le focus à l'arrivée sur l'écran. */
  tabIndex?: number;
  className?: string;
};

/**
 * Grand titre en police d'affiche, toujours en capitales. Un texte qui
 * contient un caractère absent de la police est signalé en développement et
 * rendu en Poppins 800 (jamais de lettre de repli au milieu d'un mot).
 */
export function TitreAffiche({
  children,
  niveau = "h2",
  taille,
  id,
  tabIndex,
  className,
}: TitreAfficheProps) {
  const affichable = estTexteAffiche(children);

  if (!affichable && process.env.NODE_ENV !== "production") {
    // Signalement voulu, en développement seulement.
    // eslint-disable-next-line no-console
    console.error(
      `TitreAffiche : « ${children} » contient un caractère absent de Balbeer Rustic (accent ou signe). Repli sur Poppins 800 ; écrire le titre sans accent ni signe.`,
    );
  }

  const Balise = niveau;

  return (
    <Balise
      className={styleTitre({ taille, affichable, className })}
      id={id}
      tabIndex={tabIndex}
    >
      {children}
    </Balise>
  );
}
