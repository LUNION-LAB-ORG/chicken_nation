"use client";

import { useEffect } from "react";

export default function AppMobileDownload() {
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = userAgent.includes("android");
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    console.log({ userAgent, isAndroid, isIOS });

    // Enregistrer le clic
    fetch("https://chicken.turbodeliveryapp.com/api/v1/analytics/app-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: isAndroid ? "android" : isIOS ? "ios" : "web",
        userAgent,
      }),
    });

    // Redirection
    if (isAndroid) {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.chickennation.app";
    } else if (isIOS) {
      window.location.href =
        "https://apps.apple.com/ci/app/chicken-nation/id6745905607";
    } else {
      // Desktop (tu peux afficher une page d’explication)
      window.location.href = "https://chicken-nation.com/app-mobile";
    }
  }, []);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-2xl font-bold text-center">Redirection en cours...</p>
    </div>
  );
}
