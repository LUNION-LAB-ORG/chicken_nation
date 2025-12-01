"use client";

import { baseURL } from "@/config/api";
import { useEffect } from "react";

export default function AppMobileDownload() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const finalLandingPage = "https://chicken-nation.com/fr/app-mobile";

    const handleRedirect = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = userAgent.includes("android");
      const isIOS = /iphone|ipad|ipod/.test(userAgent);

      // --- 🧠 Étape 1 : Enregistrer le clic ---
      fetch(baseURL + "/marketing/app-mobile/app-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: isAndroid ? "android" : isIOS ? "ios" : "web",
          userAgent,
        }),
      }).catch(console.error);

      // Si l'utilisateur est sur un Desktop (pas iOS/Android), on le redirige tout de suite
      if (!isAndroid && !isIOS) {
        // Redirection immédiate vers la page d'info pour Desktop
        window.location.replace(finalLandingPage);
        return; // Arrêter la fonction ici
      }

      // --- 🧠 Étape 2 : Essayer d'ouvrir l'app directement ---
      const deepLink = "chickennation://home";
      window.location.href = deepLink; // Tentative d'ouverture de l'application

      // --- 🧠 Étape 3 : Si l'app ne s'ouvre pas, lancer le Store après 2 secondes ---
      timeoutId = setTimeout(() => {
        let storeLink = finalLandingPage; // Par défaut, la page d'atterrissage finale

        if (isAndroid) {
          storeLink = process.env.NEXT_PUBLIC_PLAY_STORE_LINK!;
        } else if (isIOS) {
          storeLink = process.env.NEXT_PUBLIC_APP_STORE_LINK!;
        }

        // On redirige vers le Store ou la page d'atterrissage finale (si Store n'est pas défini)
        window.location.replace(storeLink);

        // NOTE TRÈS IMPORTANTE :
        // Dès que l'utilisateur est redirigé vers le Store, la page web est "mise en pause" 
        // ou fermée par le navigateur. IL N'EST PAS POSSIBLE DE LE RAMENER 
        // AUTOMATIQUEMENT VERS finalLandingPage APRÈS.

        // L'utilisateur devra revenir manuellement (bouton "Retour" du Store ou du navigateur).
        // C'est pourquoi la page finalLandingPage doit être la destination pour les utilisateurs Desktop.
      }, 2000);
    };

    handleRedirect();

    // --- 🧹 Fonction de nettoyage ---
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-2xl font-bold text-center">
        Redirection en cours. Si l'application ne se lance pas, vous serez envoyé(e) vers le Store.
      </p>
    </div>
  );
}