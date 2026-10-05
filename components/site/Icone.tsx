import { cn } from "@/lib/utils";

/** Symboles de public/assets/site/icones.svg (maquette, HTML 1-36, et WhatsApp). */
export const NOMS_ICONES = [
  "panier",
  "plus",
  "moins",
  "croix",
  "menu",
  "poubelle",
  "etoile",
  "mobile",
  "fleche",
  "retour",
  "droite",
  "coche",
  "loupe",
  "repere",
  "viseur",
  "cadenas",
  "cadeau",
  "feu",
  "cuisine",
  "scooter",
  "sac",
  "facebook",
  "instagram",
  "lecture",
  "pause",
  "son",
  "muet",
  "couronne",
  "gratter",
  "mystere",
  "amis",
  "etiquette",
  "telephone",
  "whatsapp",
] as const;

export type NomIcone = (typeof NOMS_ICONES)[number];

// Un seul fichier pour toutes les icônes, gardé en cache par le navigateur.
const SPRITE = "/assets/site/icones.svg";

/**
 * Icône décorative (masquée aux lecteurs d'écran), couleur du texte.
 * 20 px par défaut ; la taille se règle par className (size-4, size-6...).
 */
export function Icone({
  nom,
  className,
}: {
  nom: NomIcone;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn("block size-5 shrink-0", className)}
      focusable="false"
    >
      <use href={`${SPRITE}#i-${nom}`} />
    </svg>
  );
}
