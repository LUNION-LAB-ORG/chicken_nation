"use client";

import { useRouter } from "next/navigation";

import Connexion from "./Connexion";

import { INSECABLE } from "@/lib/typo";

const TEXTES = {
  suivi: {
    titre: "Suivre votre commande",
    texte: `Connectez-vous avec le numéro utilisé pour cette commande${INSECABLE}: vous verrez où elle en est et ce qu'elle vous rapporte.`,
  },
  commandes: {
    titre: "Vos commandes, vos points, vos cadeaux",
    texte:
      "Une fois connecté, retrouvez ici vos commandes en cours et passées, vos points et vos cadeaux. Une commande pas encore payée peut encore être modifiée.",
  },
} as const;

/**
 * Connexion demandée par le suivi et Mes commandes (maquette, JS 1463-1467) :
 * le formulaire de connexion, puis une explication à côté (dessous sur
 * téléphone). La page recharge ses données une fois le client connecté.
 * Le H1 reste celui de la page (EnteteEcran), dans cet état aussi.
 * `etapeInitiale="profil"` : connecté, mais prénom ou nom manquant.
 */
export default function ConnexionRequise({
  etapeInitiale = "telephone",
  contexte = "commandes",
}: {
  etapeInitiale?: "telephone" | "profil";
  contexte?: keyof typeof TEXTES;
}) {
  const router = useRouter();
  const { titre, texte } = TEXTES[contexte];

  return (
    <div className="grid grid-cols-1 items-start gap-5 min-[1000px]:grid-cols-[minmax(0,448px)_minmax(0,1fr)] min-[1000px]:gap-7">
      <Connexion
        etapeInitiale={etapeInitiale}
        onConnecte={() => router.refresh()}
      />
      <section
        aria-labelledby="t-connexion-requise"
        className="grid min-w-0 gap-2 rounded-panneau border border-trait bg-white px-[18px] py-5 md:px-7 md:py-[26px]"
      >
        <h2
          className="text-lg leading-tight font-bold"
          id="t-connexion-requise"
        >
          {titre}
        </h2>
        <p className="text-[13px] leading-[1.45] text-encre-doux">{texte}</p>
      </section>
    </div>
  );
}
