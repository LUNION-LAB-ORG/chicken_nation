import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../meta";

import { PageAppli } from "@/components/site/appli/PageAppli";
import { obtenirAvisPublics } from "@/features/client/commentaire.api";
import { obtenirConfigFidelite } from "@/features/fidelite/fidelite.api";

// Statique, reconstruite au plus toutes les heures (avis et règles de fidélité
// lus dans l'API, gardés une heure eux aussi).
export const revalidate = 3600;

export const metadata = pageMetadata({
  chemin: "/app-mobile",
  titre: "Application mobile, Android et iPhone",
  description:
    "Commandez, suivez votre livraison, grattez vos cartes Gratte et Gagne et jouez au Combo Mystère dans l'application, sur Google Play et l'App Store.",
});

export default async function AppMobile({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);
  const [fidelite, avis] = await Promise.all([
    obtenirConfigFidelite(),
    obtenirAvisPublics(12),
  ]);

  return <PageAppli avis={avis} fidelite={fidelite} />;
}
