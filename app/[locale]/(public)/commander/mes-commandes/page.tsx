import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import ConnexionRequise from "@/features/commande/components/ConnexionRequise";
import { obtenirClientAction } from "@/features/commande/actions/connexion.action";
import { listerCommandesAction } from "@/features/commande/actions/commande.action";
import { fcfa } from "@/features/commande/utils/panier.utils";
import { couleurStatut, libelleStatut } from "@/features/commande/utils/statut.utils";

export const metadata: Metadata = {
  title: "Mes commandes",
  robots: { index: false, follow: false },
};

const dateLisible = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default async function MesCommandesPage() {
  const client = await obtenirClientAction();
  /**
   * Connecté sans prénom ou nom : connexion inachevée. Le cookie posé au code
   * validé redessine la page ; sans ce test, la liste remplaçait l'étape du
   * nom et les commandes suivantes partaient au nom de « null null ».
   */
  if (!client?.first_name || !client?.last_name) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 pb-16 pt-28">
        <ConnexionRequise etapeInitiale={client ? "profil" : "telephone"} />
      </div>
    );
  }
  const res = await listerCommandesAction();
  return (
    <div className="min-h-[60vh] bg-gray-50 px-4 pb-16 pt-28">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <h1 className="text-2xl font-bold">Mes commandes</h1>
        {!res.ok ? (
          <p className="text-gray-700">{res.message}</p>
        ) : res.data.length === 0 ? (
          <p className="text-gray-700">
            Aucune commande pour le moment.{" "}
            <Link href="/restaurants/nos-menus" className="font-semibold text-primary underline">
              Voir le menu
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {res.data.map((c) => (
              <li key={c.id}>
                <Link href={`/commander/${c.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
                  <span>
                    <span className="block font-semibold">Commande {c.reference}</span>
                    <span className="block text-sm text-gray-500">
                      {c.created_at ? dateLisible(c.created_at) : ""} · {fcfa(c.amount)}
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${couleurStatut(c)}`}>{libelleStatut(c)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
