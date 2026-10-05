"use client";

import { type ReactNode, useEffect, useRef } from "react";

import { BoutonRond } from "./BoutonRond";
import { fenetreFermee, fenetreOuverte } from "./fenetres";
import { Annonce } from "./MessageFlottant";
import styles from "./Feuille.module.css";

import { cn } from "@/lib/utils";

/**
 * Fenêtre modale (<dialog> + showModal) : le reste de la page devient inerte,
 * le focus y reste. Elle se ferme au clic sur le fond et par Échap, et rend
 * le focus à l'élément qui l'a ouverte. L'état ouvert appartient au parent.
 */
export function Feuille({
  ouverte,
  onFermer,
  titreId,
  forme = "fiche",
  libelleFermer,
  className,
  children,
}: {
  ouverte: boolean;
  onFermer: () => void;
  /** id du titre de la fenêtre (aria-labelledby). */
  titreId: string;
  /** fiche : grand panneau ; tiroir : panier à droite ; centre : petite fenêtre. Sur téléphone, toutes montent du bas. */
  forme?: "fiche" | "tiroir" | "centre";
  /** Bouton rond « fermer » en haut à droite, avec ce nom (« Fermer la fiche »). */
  libelleFermer?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const origine = useRef<HTMLElement | null>(null);
  const etat = useRef({ ouverte, onFermer });

  useEffect(() => {
    etat.current = { ouverte, onFermer };
  });

  useEffect(() => {
    const dialogue = ref.current;

    if (!dialogue) return;

    if (ouverte && !dialogue.open) {
      origine.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      if (typeof dialogue.showModal === "function") dialogue.showModal();
      else dialogue.setAttribute("open", "");
      fenetreOuverte(dialogue);
    } else if (!ouverte && dialogue.open) {
      dialogue.close();
    }
  }, [ouverte]);

  useEffect(() => {
    const dialogue = ref.current;

    if (!dialogue) return;

    const surFermeture = () => {
      // L'évènement arrive après coup : la fenêtre a pu être rouverte entre-temps
      // (double montage du mode strict de React en développement).
      if (dialogue.open) return;
      fenetreFermee(dialogue);
      const element = origine.current;

      origine.current = null;
      if (element?.isConnected) element.focus();
      // Fermée par le navigateur (Échap appuyé deux fois) : le parent suit.
      if (etat.current.ouverte) etat.current.onFermer();
    };
    // Échap : c'est le parent qui ferme, pour garder un seul état.
    const surAnnulation = (e: Event) => {
      e.preventDefault();
      etat.current.onFermer();
    };
    // Clic sur le fond (hors du contenu) : appui ET relâche sur le fond, pour
    // ne pas fermer à la fin d'une sélection de texte. Le clavier a Échap.
    let appuiSurFond = false;
    const surAppui = (e: PointerEvent) => {
      appuiSurFond = e.target === dialogue;
    };
    const surClic = (e: MouseEvent) => {
      if (appuiSurFond && e.target === dialogue) etat.current.onFermer();
      appuiSurFond = false;
    };

    dialogue.addEventListener("close", surFermeture);
    dialogue.addEventListener("cancel", surAnnulation);
    dialogue.addEventListener("pointerdown", surAppui);
    dialogue.addEventListener("click", surClic);

    return () => {
      dialogue.removeEventListener("close", surFermeture);
      dialogue.removeEventListener("cancel", surAnnulation);
      dialogue.removeEventListener("pointerdown", surAppui);
      dialogue.removeEventListener("click", surClic);
      if (dialogue.open) {
        dialogue.close();
        fenetreFermee(dialogue);
      }
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titreId}
      className={cn(styles.feuille, styles[forme], className)}
    >
      {children}
      {libelleFermer ? (
        <BoutonRond
          className={styles.fermer}
          icone="croix"
          libelle={libelleFermer}
          variante="blanc"
          onClick={onFermer}
        />
      ) : null}
      {/* Le reste de la page est inerte pendant l'ouverture : les annonces
          aux lecteurs d'écran passent par cette zone. */}
      <Annonce />
    </dialog>
  );
}
