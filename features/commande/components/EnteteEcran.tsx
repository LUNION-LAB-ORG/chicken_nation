import type { ReactNode } from "react";

import { Conteneur } from "@/components/site/Section";
import { TitreAffiche } from "@/components/site/TitreAffiche";
import { cn } from "@/lib/utils";

/**
 * En-tête compact des écrans de la commande (maquette, HTML 368-390 et CSS
 * 882-890) : aplat orange (Mes commandes) ou jaune (suivi) avec son motif,
 * titre H1 en police d'affiche, puis une ou deux lignes dessous. Le H1 est là
 * dans tous les états de la page, connexion requise comprise.
 * Sans état : rendu côté serveur comme dans le navigateur.
 */
export function EnteteEcran({
  titre,
  id,
  fond = "orange",
  children,
}: {
  /** Texte fixe, sans accent (police d'affiche). */
  titre: string;
  /** id du H1 (aria-labelledby de la section). */
  id: string;
  fond?: "orange" | "jaune";
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "[background-size:72px_72px] bg-repeat pt-[26px] pb-5 text-encre",
        fond === "jaune"
          ? "bg-jaune [background-image:var(--motif-sombre)]"
          : "bg-orange [background-image:var(--motif-clair)]",
      )}
    >
      <Conteneur>
        <TitreAffiche
          className={
            fond === "jaune"
              ? "text-encre"
              : "text-white [text-shadow:3px_3px_0_var(--color-encre)]"
          }
          id={id}
          niveau="h1"
          tabIndex={-1}
          taille="compacte"
        >
          {titre}
        </TitreAffiche>
        {children ? (
          <div className="mt-2 grid max-w-[40em] gap-1.5 font-medium">
            {children}
          </div>
        ) : null}
      </Conteneur>
    </section>
  );
}
