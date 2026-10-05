import type { Metadata } from "next";

import { setRequestLocale } from "next-intl/server";

import { Conteneur } from "@/components/site/Section";
import { listerCommandesAction } from "@/features/commande/actions/commande.action";
import { lireCompteAction } from "@/features/commande/actions/compte.action";
import { obtenirClientAction } from "@/features/commande/actions/connexion.action";
import ConnexionRequise from "@/features/commande/components/ConnexionRequise";
import { EnteteEcran } from "@/features/commande/components/EnteteEcran";
import { MesCommandes } from "@/features/commande/components/MesCommandes";

export const metadata: Metadata = {
  title: "Mes commandes",
  robots: { index: false, follow: false },
};

export default async function MesCommandesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  const client = await obtenirClientAction();
  /**
   * Connecté sans prénom ou nom : connexion inachevée. Le cookie posé au code
   * validé redessine la page ; sans ce test, la liste remplaçait l'étape du
   * nom et les commandes suivantes partaient au nom de « null null ».
   */
  const connecte = !!client?.first_name && !!client?.last_name;
  const [commandes, compte] = connecte
    ? await Promise.all([listerCommandesAction(), lireCompteAction()])
    : [null, null];

  return (
    <>
      <EnteteEcran id="titre-commandes" titre="Mes commandes">
        <p>
          Le même compte que dans l&apos;application{" "}: commandes, points et
          cadeaux.
        </p>
      </EnteteEcran>
      <Conteneur className="pt-6 pb-14 min-[1000px]:pt-8 min-[1000px]:pb-18">
        {client && connecte && commandes && compte ? (
          <MesCommandes client={client} commandes={commandes} compte={compte} />
        ) : (
          <ConnexionRequise
            contexte="commandes"
            etapeInitiale={client ? "profil" : "telephone"}
          />
        )}
      </Conteneur>
    </>
  );
}
