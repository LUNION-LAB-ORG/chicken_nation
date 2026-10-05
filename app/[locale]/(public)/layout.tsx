import { metadata, organizationSchema, viewport } from "../meta";

import { BarrePanier } from "@/components/site/BarrePanier";
import { Entete } from "@/components/site/entete/Entete";
import { Annonce, MessageFlottant } from "@/components/site/MessageFlottant";
import { PiedDePage } from "@/components/site/pied/PiedDePage";
import { FenetresCommande } from "@/features/commande/components/FenetresCommande";

export { metadata, viewport };

/**
 * Mise en page des pages publiques : lien « Aller au contenu », en-tête
 * collant, contenu, pied de page, puis les îlots communs (barre du panier,
 * fenêtres de la commande, message flottant et zone lue par les lecteurs
 * d'écran).
 * Les aplats vont bord à bord : chaque section gère sa largeur de 1 200 px.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        type="application/ld+json"
      />
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:rounded-pilule focus:bg-white focus:px-4 focus:py-2.5 focus:font-semibold focus:text-encre focus:shadow-2"
        href="#contenu"
      >
        Aller au contenu
      </a>
      <div className="flex min-h-dvh flex-col">
        <Entete />
        {/* clip et non hidden : les barres collantes des pages (pastilles de
            la carte) restent collantes. */}
        <main className="flex flex-1 flex-col overflow-x-clip" id="contenu">
          {children}
        </main>
        <PiedDePage />
      </div>
      <BarrePanier />
      {/* Fenêtres de la commande (fiche plat, tiroir du panier), chargées à
          la demande. */}
      <FenetresCommande />
      <MessageFlottant />
      <Annonce />
    </>
  );
}
