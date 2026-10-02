import type { Metadata } from "next";
import SuiviCommande from "@/features/commande/components/SuiviCommande";
import ConnexionRequise from "@/features/commande/components/ConnexionRequise";
import { obtenirClientAction } from "@/features/commande/actions/connexion.action";

export const metadata: Metadata = {
  title: "Suivi de commande",
  robots: { index: false, follow: false },
};

export default async function SuiviPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payer?: string }>;
}) {
  const [{ id }, { payer }, client] = await Promise.all([params, searchParams, obtenirClientAction()]);
  return (
    <div className="min-h-[60vh] bg-gray-50 px-4 pb-16 pt-28">
      {client ? <SuiviCommande id={id} client={client} ouvrirPaiement={payer === "1"} /> : <ConnexionRequise />}
    </div>
  );
}
