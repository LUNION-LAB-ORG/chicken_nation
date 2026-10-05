"use client";

import { Bouton } from "../Bouton";
import { afficherMessage } from "../MessageFlottant";

import { SITE_URL } from "@/lib/seo/commun";
import { INSECABLE } from "@/lib/typo";

/**
 * « Partager » la page d'un plat : feuille de partage du téléphone (WhatsApp
 * et les autres applications), sinon copie du lien. L'adresse partagée est
 * celle de la page sur www.chicken-nation.com, sans paramètre ni ancre.
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
    // Toujours l'adresse de référence (www) : un visiteur arrivé par le
    // domaine nu ne doit pas propager une seconde adresse de la page.
    const url = `${SITE_URL}${window.location.pathname}`;

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
