import type { IRestaurantSite } from "@/features/restaurants/restaurants.site";
import type { Metadata } from "next";

import { setRequestLocale } from "next-intl/server";
import { preconnect } from "react-dom";

import { slugValide } from "@/components/site/carte/retrait-demande";
import { Lien } from "@/components/site/Lien";
import { TitreAffiche } from "@/components/site/TitreAffiche";
import {
  lireConditionsCommandeAction,
  lireReglagesFideliteAction,
  livraisonDisponibleAction,
} from "@/features/commande/actions/commande.action";
import { obtenirClientAction } from "@/features/commande/actions/connexion.action";
import { BarreEtapes } from "@/features/commande/components/caisse/BarreEtapes";
import { Caisse } from "@/features/commande/components/caisse/Caisse";
import { obtenirRestaurantsDuSite } from "@/features/restaurants/restaurant.api";

export const metadata: Metadata = {
  title: "Votre commande",
  robots: { index: false, follow: false },
};

/**
 * Caisse en 5 étapes (lot L11c) : page dynamique (cookie `cn_client`), jamais
 * indexée. L'en-tête orange, son H1 et la barre des étapes sont rendus ici ;
 * la caisse elle-même vit dans le navigateur (panier, choix gardés).
 */
export default async function CommanderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ retrait?: string | string[] }>;
}) {
  const [{ locale }, { retrait }] = await Promise.all([params, searchParams]);

  setRequestLocale(locale);
  // Le module de paiement se charge à l'étape 5 : la connexion est prête avant.
  preconnect("https://cdn.kkiapay.me");

  const [client, restaurants, livraison, conditions, reglages] =
    await Promise.all([
      obtenirClientAction(),
      // Restaurants illisibles : la caisse reste ouverte (livraison possible)
      // et dit que le retrait ne peut pas être proposé.
      obtenirRestaurantsDuSite().then(
        (liste): IRestaurantSite[] | null => liste,
        () => null,
      ),
      livraisonDisponibleAction(),
      lireConditionsCommandeAction(),
      lireReglagesFideliteAction(),
    ]);

  return (
    // Gouttière de la caisse : 12 px sous 360 px, pour que les boutons à
    // icône tiennent sur une ligne à 320 px (retouche 14).
    <div className="[--gouttiere-caisse:12px] min-[360px]:[--gouttiere-caisse:var(--gouttiere)]">
      <section
        aria-labelledby="titre-caisse"
        className="bg-orange [background-image:var(--motif-clair)] [background-size:72px_72px] bg-repeat pt-[18px] pb-5 text-encre md:pt-[22px]"
        id="tete-caisse"
      >
        <div className="mx-auto w-full max-w-(--largeur) px-(--gouttiere-caisse)">
          <Lien
            className="text-encre hover:text-encre-forte"
            href="/fr/carte"
            icone="retour"
          >
            Continuer mes achats
          </Lien>
          <TitreAffiche
            className="text-white [text-shadow:3px_3px_0_var(--color-encre)]"
            id="titre-caisse"
            niveau="h1"
            taille="compacte"
          >
            Votre commande
          </TitreAffiche>
          <BarreEtapes />
        </div>
      </section>
      <Caisse
        clientInitial={client}
        conditions={conditions}
        erreurRestaurants={restaurants === null}
        livraison={livraison}
        reglages={reglages.ok ? reglages.data : null}
        restaurants={restaurants ?? []}
        retraitDemande={
          typeof retrait === "string" && slugValide(retrait) ? retrait : null
        }
      />
    </div>
  );
}
