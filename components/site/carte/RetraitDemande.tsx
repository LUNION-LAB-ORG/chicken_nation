"use client";

import { useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { styleBouton } from "../Bouton";
import { Icone } from "../Icone";
import { Lien } from "../Lien";
import { afficherMessage } from "../MessageFlottant";
import { EtatOuverture } from "../restaurants/EtatOuverture";

import {
  lireRetraitDemande,
  memoriserRetraitDemande,
  oublierRetraitDemande,
} from "./retrait-demande";

import {
  modeAtom,
  restaurantIdAtom,
} from "@/features/commande/stores/caisse.store";
import { panierAtom } from "@/features/commande/stores/panier.store";
import { nombreArticles } from "@/features/commande/utils/panier.utils";
import { etatOuverture } from "@/features/restaurants/horaires";
import { trouverRestaurant } from "@/features/restaurants/restaurants.site";

export interface IRestaurantRetrait {
  /** Identifiant de l'API : le tiroir et la caisse passent en retrait sur ce restaurant. */
  id: string;
  slug: string;
  /** Nom affiché (« Angré »). */
  nom: string;
  schedule: string | null;
}

/** « Retrait à Angré (fermé, ouvre à 10 h). Choisissez vos plats, puis passez commande. » (maquette, JS 1599-1614) */
export function messageRetrait(r: IRestaurantRetrait, maintenant = new Date()) {
  const etat = etatOuverture(r.schedule, maintenant);
  const precision = etat.ouvert
    ? ""
    : ` (${etat.texte.charAt(0).toLocaleLowerCase("fr")}${etat.texte.slice(1)})`;

  return `Retrait à ${r.nom}${precision}. Choisissez vos plats, puis passez commande.`;
}

/**
 * Lecture de `?retrait=<slug>` (« Retirer ici » d'un restaurant, panier vide).
 * Le choix est gardé le temps de l'onglet pour la caisse (retrait-demande.ts),
 * le tiroir passe en retrait sur ce restaurant, le choix est annoncé par un
 * message, puis le paramètre est retiré de l'adresse.
 * Un bandeau le rappelle en tête de la carte, avec l'état d'ouverture du
 * restaurant et, dès qu'un plat est au panier, « Passer commande », qui mène
 * à la caisse en retrait sur ce restaurant. Un slug inconnu est ignoré.
 *
 * Tout se passe dans le navigateur : la page reste statique et son adresse
 * de référence reste `/fr/carte`.
 */
export function RetraitDemande({
  restaurants,
}: {
  restaurants: readonly IRestaurantRetrait[];
}) {
  const parametres = useSearchParams();
  const demande = parametres.get("retrait");
  const lignes = useAtomValue(panierAtom);
  const [choix, setChoix] = useState<IRestaurantRetrait | null>(null);
  const setMode = useSetAtom(modeAtom);
  const setRestaurantId = useSetAtom(restaurantIdAtom);

  useEffect(() => {
    let arrivee: IRestaurantRetrait | null = null;

    if (demande !== null) {
      arrivee = trouverRestaurant(restaurants, demande);
      if (arrivee) {
        memoriserRetraitDemande(arrivee.slug);
        // Le tiroir du panier suit tout de suite : « Retrait » coché sur ce
        // restaurant, sans alerte « livraison impossible » pour un plat à emporter.
        setMode("PICKUP");
        setRestaurantId(arrivee.id);
      }
      const url = new URL(window.location.href);

      url.searchParams.delete("retrait");
      window.history.replaceState(
        window.history.state,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
    const memoire = lireRetraitDemande();

    setChoix(
      arrivee ?? (memoire ? trouverRestaurant(restaurants, memoire) : null),
    );
    if (!arrivee) return;
    const texte = messageRetrait(arrivee);
    // Après les effets de la page : l'hôte du message (mise en page) est alors à l'écoute.
    const minuteur = setTimeout(() => afficherMessage(texte), 0);

    return () => clearTimeout(minuteur);
  }, [demande, restaurants, setMode, setRestaurantId]);

  if (!choix) return null;
  const panierVide = nombreArticles(lignes) === 0;

  return (
    <aside
      aria-label="Retrait au restaurant"
      className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-carte border-[1.5px] border-encre bg-jaune-pale px-4 py-3"
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-encre text-jaune"
      >
        <Icone nom="sac" />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="leading-[1.3] font-bold">
          Retrait à Chicken Nation {choix.nom}
        </p>
        <EtatOuverture schedule={choix.schedule} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {panierVide ? (
          <p className="text-sm text-encre-doux">
            Choisissez vos plats, puis passez commande.
          </p>
        ) : (
          <Link
            className={styleBouton()}
            href={`/fr/commander?retrait=${encodeURIComponent(choix.slug)}`}
            prefetch={false}
          >
            Passer commande
            <Icone className="size-[18px]" nom="fleche" />
          </Link>
        )}
        <Lien
          aria-label={`Annuler le retrait à ${choix.nom}`}
          onClick={() => {
            oublierRetraitDemande();
            setChoix(null);
            afficherMessage("Retrait annulé");
          }}
        >
          Annuler
        </Lien>
      </div>
    </aside>
  );
}
