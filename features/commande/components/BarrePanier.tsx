"use client";

import { useAtomValue } from "jotai";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { panierAtom } from "../stores/panier.store";
import { fcfa, nombreArticles, sousTotal } from "../utils/panier.utils";

/** Barre collée en bas de la carte dès que le panier contient un article. */
export function BarrePanier() {
  const lignes = useAtomValue(panierAtom);
  const nb = nombreArticles(lignes);
  if (nb === 0) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <Link
        href="/commander"
        className="flex w-full max-w-md items-center justify-between rounded-2xl bg-primary px-5 py-4 text-white shadow-xl shadow-primary/40"
      >
        <span className="flex items-center gap-2 font-semibold">
          <ShoppingBag size={20} /> Voir le panier ({nb})
        </span>
        <span className="font-bold">{fcfa(sousTotal(lignes))}</span>
      </Link>
    </div>
  );
}

/** Icône panier de l'en-tête, avec le nombre d'articles. */
export function IconePanier() {
  const nb = nombreArticles(useAtomValue(panierAtom));
  return (
    <Link href="/commander" aria-label={`Panier, ${nb} article${nb > 1 ? "s" : ""}`} className="relative text-white">
      <ShoppingBag size={24} />
      {nb > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-xs font-bold text-secondary-foreground">
          {nb}
        </span>
      )}
    </Link>
  );
}
