"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Widget de paiement KKiaPay pour le web (https://cdn.kkiapay.me/k.js).
 *
 * `data` porte la RÉFÉRENCE de la commande : le webhook KKiaPay la renvoie au
 * serveur (stateData), qui retrouve la commande, vérifie le montant et la
 * marque payée. Comme l'application, le site ne confirme rien lui-même : il
 * relit la commande jusqu'à la voir payée.
 */

interface OptionsWidget {
  amount: number;
  key: string;
  sandbox: boolean;
  phone?: string;
  name?: string;
  email?: string;
  reason?: string;
  data: string;
  theme?: string;
  position?: "left" | "right" | "center";
}

declare global {
  interface Window {
    openKkiapayWidget?: (options: OptionsWidget) => void;
    addSuccessListener?: (cb: (reponse: { transactionId?: string }) => void) => void;
    addFailedListener?: (cb: (erreur: unknown) => void) => void;
    removeKkiapayListener?: (evenement: string) => void;
  }
}

const URL_SCRIPT = "https://cdn.kkiapay.me/k.js";
let chargement: Promise<void> | null = null;

function chargerScript(): Promise<void> {
  if (window.openKkiapayWidget) return Promise.resolve();
  chargement ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = URL_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      chargement = null;
      reject(new Error("KKiaPay indisponible"));
    };
    document.head.appendChild(s);
  });
  return chargement;
}

export function useKkiapay({ onSucces, onEchec }: { onSucces: () => void; onEchec: () => void }) {
  const [pret, setPret] = useState(false);
  const rappels = useRef({ onSucces, onEchec });
  rappels.current = { onSucces, onEchec };

  useEffect(() => {
    let actif = true;
    chargerScript()
      .then(() => {
        if (!actif) return;
        window.addSuccessListener?.(() => rappels.current.onSucces());
        window.addFailedListener?.(() => rappels.current.onEchec());
        setPret(true);
      })
      .catch(() => actif && setPret(false));
    return () => {
      actif = false;
      window.removeKkiapayListener?.("success");
      window.removeKkiapayListener?.("failed");
    };
  }, []);

  const ouvrir = useCallback((options: OptionsWidget) => {
    if (!window.openKkiapayWidget) return false;
    window.openKkiapayWidget({ theme: "#fd8127", position: "center", ...options });
    return true;
  }, []);

  return { pret, ouvrir };
}
