import type { Metadata } from "next";

import { setRequestLocale } from "next-intl/server";

import { Conteneur } from "@/components/site/Section";
import {
  lireReglagesFideliteAction,
  obtenirCommandeAction,
} from "@/features/commande/actions/commande.action";
import { obtenirClientAction } from "@/features/commande/actions/connexion.action";
import ConnexionRequise from "@/features/commande/components/ConnexionRequise";
import { EnteteEcran } from "@/features/commande/components/EnteteEcran";
import SuiviCommande from "@/features/commande/components/SuiviCommande";

export const metadata: Metadata = {
  title: "Suivi de commande",
  robots: { index: false, follow: false },
};

export default async function SuiviPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ payer?: string }>;
}) {
  const [{ locale, id }, { payer }, client] = await Promise.all([
    params,
    searchParams,
    obtenirClientAction(),
  ]);

  setRequestLocale(locale);
  // Connecté sans prénom ou nom : connexion inachevée, on reprend à l'étape du nom.
  const connecte = !!client?.first_name && !!client?.last_name;

  if (!client || !connecte) {
    return (
      <>
        <EnteteEcran fond="jaune" id="titre-suivi" titre="Suivi de commande" />
        <Conteneur className="pt-6 pb-14 min-[1000px]:pt-8 min-[1000px]:pb-18">
          <ConnexionRequise
            contexte="suivi"
            etapeInitiale={client ? "profil" : "telephone"}
          />
        </Conteneur>
      </>
    );
  }

  /**
   * Commande lue dès le rendu serveur : la page arrive remplie, sans attente
   * ni grand vide ; le suivi la relit ensuite tout seul. Taux des points pour
   * « +N points crédités » (rien n'est écrit en dur).
   */
  const [lecture, reglages] = await Promise.all([
    obtenirCommandeAction(id),
    lireReglagesFideliteAction(),
  ]);

  return (
    <SuiviCommande
      client={client}
      id={id}
      lectureInitiale={lecture}
      ouvrirPaiement={payer === "1"}
      pointsParFranc={reglages.ok ? reglages.data.pointsParFranc : null}
    />
  );
}
