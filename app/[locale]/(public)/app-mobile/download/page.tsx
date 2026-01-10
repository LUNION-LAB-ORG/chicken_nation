"use client";

import { baseURL } from "@/config/api";
import { useEffect } from "react";

export default function AppMobileDownload() {
  useEffect(() => {
    async function handleClick() {
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = userAgent.includes("android");
      const isIOS = /iphone|ipad|ipod/.test(userAgent);

      // 🧠 Étape 1 — Enregistrer le clic
      fetch(baseURL + "/marketing/app-mobile/app-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: isAndroid ? "android" : isIOS ? "ios" : "web",
          userAgent,
        }),
      }).catch(console.error);

      // 🧠 Étape 2 — Essayer d'ouvrir l'app directement
      const deepLink = "chickennation://home";

      // Si app installée → elle s'ouvrira
      window.location.href = deepLink;

      // 🧠 Étape 3 — Si rien ne se passe, après 2 secondes, on envoie vers le store
      setTimeout(() => {
        // Redirection
        if (isAndroid) {
          window.location.href =
            process.env.NEXT_PUBLIC_PLAY_STORE_LINK ||
            "https://play.google.com/store/apps/details?id=com.chickennation.app";
        } else if (isIOS) {
          window.location.href =
            process.env.NEXT_PUBLIC_APP_STORE_LINK ||
            "https://apps.apple.com/ci/app/chicken-nation/id6745905607";
        } else {
          // Desktop (tu peux afficher une page d’explication)
          window.location.href = "https://chicken-nation.com/app-mobile";
        }
      }, 2000);
    }
    handleClick();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-2xl font-bold text-center">Redirection en cours...</p>
    </div>
  );
}
