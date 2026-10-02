import type { Metadata } from "next";
import Panier from "@/features/commande/components/Panier";
import { obtenirClientAction } from "@/features/commande/actions/connexion.action";
import { livraisonDisponibleAction } from "@/features/commande/actions/commande.action";
import { obtenirRestaurantsPublics } from "@/features/restaurants/restaurant.api";

export const metadata: Metadata = {
  title: "Mon panier",
  robots: { index: false, follow: false },
};

export default async function CommanderPage() {
  const [client, restaurants, livraison] = await Promise.all([
    obtenirClientAction(),
    obtenirRestaurantsPublics(),
    livraisonDisponibleAction(),
  ]);
  return (
    <div className="min-h-[60vh] bg-gray-50 px-4 pb-16 pt-28">
      <h1 className="mx-auto mb-6 max-w-5xl text-2xl font-bold">Ma commande</h1>
      <Panier clientInitial={client} restaurants={restaurants} livraison={livraison} />
    </div>
  );
}
