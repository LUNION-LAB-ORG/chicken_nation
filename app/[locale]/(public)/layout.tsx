import { metadata, organizationSchema, viewport } from "../meta";

import Footer from "@/components/(public)/common/footer";
import Header from "@/components/(public)/common/header";

export { metadata, viewport };

/**
 * Mise en page des pages publiques. Plus de largeur plafonnée (les aplats vont
 * bord à bord) ni de bloc « Télécharger l'application » sur toutes les pages.
 * L'en-tête et le pied de page actuels restent jusqu'au nouveau gabarit (lot L5).
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
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
        <Header />
        <main className="flex flex-1 flex-col" id="contenu">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
