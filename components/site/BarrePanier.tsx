"use client";

import { useAtomValue, useSetAtom } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CHEMIN_CAISSE, sansBarrePanier } from "./entete/liens";

import {
  tiroirPanierBrancheAtom,
  tiroirPanierOuvertAtom,
} from "@/features/commande/stores/interface.store";
import { panierAtom } from "@/features/commande/stores/panier.store";
import {
  nombreArticles,
  sousTotal,
} from "@/features/commande/utils/panier.utils";
import { fcfa, pluriel } from "@/lib/typo";

/**
 * Barre du panier (maquette, HTML 433-439, CSS 1179-1200) : collée en bas sur
 * téléphone, pilule en bas à droite dès 900 px. Visible dès qu'un plat est
 * dans le panier, sauf sur la caisse et le suivi d'une commande. Ouvre le
 * tiroir une fois branché (lot L11b), mène à la caisse avant.
 *
 * Sur téléphone, une cale de la hauteur de la barre suit le pied de page :
 * la barre ne cache jamais le bas de la page (body.avec-barre de la maquette).
 */
export function BarrePanier() {
  const chemin = usePathname();
  const lignes = useAtomValue(panierAtom);
  const tiroirBranche = useAtomValue(tiroirPanierBrancheAtom);
  const ouvrirTiroir = useSetAtom(tiroirPanierOuvertAtom);
  const nombre = nombreArticles(lignes);

  if (nombre === 0 || sansBarrePanier(chemin)) return null;

  const total = fcfa(sousTotal(lignes));
  const libelle = `${tiroirBranche ? "Ouvrir le panier" : "Voir le panier"}, ${pluriel(nombre, "article", "articles")}, ${total}`;
  const classe =
    "flex min-h-[54px] w-full items-center gap-2 rounded-pilule border-0 bg-orange pr-3.5 pl-2.5 text-[clamp(14px,4.3vw,16px)] font-bold text-encre no-underline shadow-bouton hover:bg-orange-appui min-[360px]:gap-3 min-[360px]:pr-[18px] lg:w-auto lg:gap-[18px]";
  const contenu = (
    <>
      <span className="inline-grid h-[34px] min-w-[34px] place-items-center rounded-pilule bg-encre px-2 text-[15px] text-white tabular-nums">
        {nombre}
      </span>
      {/* Jamais coupé en deux lignes, même à 320 px avec un total à 6 chiffres. */}
      <span className="whitespace-nowrap">Voir le panier</span>
      <span className="ml-auto whitespace-nowrap tabular-nums">{total}</span>
    </>
  );

  return (
    <>
      <div
        aria-hidden="true"
        className="h-[calc(76px+env(safe-area-inset-bottom,0px))] lg:hidden"
      />
      <div className="fixed inset-x-0 bottom-0 z-45 border-t border-trait bg-papier px-(--gouttiere) pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] shadow-haut lg:inset-x-auto lg:right-7 lg:bottom-7 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        {tiroirBranche ? (
          <button
            aria-haspopup="dialog"
            aria-label={libelle}
            className={classe}
            type="button"
            onClick={() => ouvrirTiroir(true)}
          >
            {contenu}
          </button>
        ) : (
          <Link
            aria-label={libelle}
            className={classe}
            href={CHEMIN_CAISSE}
            prefetch={false}
          >
            {contenu}
          </Link>
        )}
      </div>
    </>
  );
}
