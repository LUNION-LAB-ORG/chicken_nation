"use client";

import { useAtom, useSetAtom } from "jotai";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import {
  ficheBrancheeAtom,
  ficheDemandeeAtom,
} from "@/features/commande/stores/interface.store";

// Chargés au premier plat demandé seulement : la carte n'embarque ni HeroUI
// ni la fiche tant qu'on n'ajoute rien.
const FichePlat = dynamic(
  () => import("@/features/commande/components/FichePlat"),
  { ssr: false },
);
const ToastProvider = dynamic(
  () => import("@heroui/toast").then((m) => m.ToastProvider),
  { ssr: false },
);

/**
 * PROVISOIRE, jusqu'au lot L11b : fiche plat actuelle (fenêtre HeroUI et son
 * message « ajouté au panier ») branchée sur `ficheDemandeeAtom`, pour que la
 * commande reste possible depuis la carte et les pages plats pendant la
 * refonte. Montée par ces pages seulement ; tant qu'elle est montée, les
 * boutons « Ajouter » ouvrent la fiche au lieu de suivre le lien.
 *
 * L11b, qui monte la nouvelle fiche dans la mise en page publique, retire ce
 * composant de `app/[locale]/(public)/carte/page.tsx` et de
 * `carte/[plat]/page.tsx`, puis supprime ce fichier : deux fiches
 * s'ouvriraient sinon ensemble.
 */
export function FicheProvisoire() {
  const [demande, setDemande] = useAtom(ficheDemandeeAtom);
  const setBranchee = useSetAtom(ficheBrancheeAtom);
  const [utilisee, setUtilisee] = useState(false);

  useEffect(() => {
    setBranchee(true);

    // Hors de ces pages, les boutons redeviennent de simples liens, et une
    // fiche restée ouverte (retour arrière) ne se rouvre pas à la visite suivante.
    return () => {
      setBranchee(false);
      setDemande(null);
    };
  }, [setBranchee, setDemande]);

  useEffect(() => {
    if (demande) setUtilisee(true);
  }, [demande]);

  if (!utilisee) return null;

  return (
    <>
      <ToastProvider
        placement="top-center"
        toastProps={{ shouldShowTimeoutProgress: true }}
      />
      <FichePlat
        platId={demande?.platId ?? null}
        onClose={() => setDemande(null)}
      />
    </>
  );
}
