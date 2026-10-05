"use client";

import { Bouton } from "../Bouton";
import { afficherMessage } from "../MessageFlottant";

import { INSECABLE } from "@/lib/typo";

/**
 * « Partager » la page d'un plat : feuille de partage du téléphone (WhatsApp
 * et les autres applications), sinon copie du lien. L'adresse partagée est
 * celle de la page, sans paramètre ni ancre.
 */
export function BoutonPartager({
  titre,
  texte,
  className,
}: {
  titre: string;
  texte: string;
  className?: string;
}) {
  const partager = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: titre, text: texte, url });
      } catch {
        // Partage annulé par le visiteur : rien à dire.
      }

      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      afficherMessage("Lien du plat copié");
    } catch {
      afficherMessage(
        `Copiez l'adresse de la page pour la partager${INSECABLE}: ${url}`,
      );
    }
  };

  return (
    <Bouton
      className={className}
      taille="grand"
      variante="secondaire"
      onClick={partager}
    >
      Partager
    </Bouton>
  );
}
