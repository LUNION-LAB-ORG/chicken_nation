import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAppClickMutation } from "@/features/marketing/app-mobile/queries/app-mobile.mutation";
import { appSchema } from "@/config/api";
import { useDishOneMutation } from "@/features/menus/queries/dish.mutation";
import { useCategoryOneMutation } from "@/features/menus/queries/category/category.mutation";
import {
  lienAppli,
  libelleSuivi,
  lireCibleDeepLink,
  lireCodeParrainage,
} from "@/features/marketing/app-mobile/utils/deep-link.utils";

export const useDeepLinkRedirect = () => {
  const searchParams = useSearchParams();

  // On extrait mutate pour le tracking
  const { mutate: mutateAppClick } = useAppClickMutation();

  // 💡 On extrait mutateAsync pour pouvoir faire des "await"
  const { mutateAsync: getDishAsync } = useDishOneMutation();
  const { mutateAsync: getCategoryAsync } = useCategoryOneMutation();

  const [status, setStatus] = useState("Préparation de la redirection…");
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    // L'astuce : créer une fonction async interne
    const processRedirect = async () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = userAgent.includes("android");
      const isIOS = /iphone|ipad|ipod/.test(userAgent);

      // 1. Construction de la route mobile (paramètres lus et contrôlés
      // dans deep-link.utils : liste blanche pour `to`, forme du code `ref`)
      const cible = lireCibleDeepLink(searchParams);
      const codeParrainage = lireCodeParrainage(searchParams.get("ref"));

      let appPath = "home"; // Route par défaut
      // Métadonnées de tracking (résolues en même temps que appPath/itemName)
      let clickType = "home";
      let clickTargetId: string | undefined = undefined;
      let clickTargetLabel = "Accueil";

      try {
        // 💡 Utilisation de await avec mutateAsync
        if (cible.genre === "categorie") {
          setStatus("Recherche de la catégorie…");
          const categoryData = await getCategoryAsync(cible.id);

          setItemName(categoryData.name);
          appPath = `category/${categoryData.id}`;
          clickType = "category";
          clickTargetId = cible.id;
          clickTargetLabel = categoryData.name;
        } else if (cible.genre === "plat") {
          setStatus("Recherche du plat…");
          const productData = await getDishAsync(cible.id);

          setItemName(productData.name);
          appPath = `menu/${productData.id}`;
          clickType = "dish";
          clickTargetId = cible.id;
          clickTargetLabel = productData.name;
        } else {
          if (cible.nom) setItemName(cible.nom);
          appPath = cible.chemin;
          clickType = cible.type;
          clickTargetId = cible.idSuivi;
          clickTargetLabel = cible.libelle;
        }
      } catch (error) {
        // eslint-disable-next-line no-console -- trace voulue, repli sur l'accueil de l'appli
        console.error("Élément introuvable en base de données :", error);
        // Si l'API échoue (ex: produit supprimé), appPath restera "home"
        // L'utilisateur sera redirigé vers l'accueil de l'app plutôt qu'une page d'erreur
      }

      // 2. Tracking Analytique (Fire-and-forget, APRÈS résolution du nom/route)
      mutateAppClick({
        platform: isAndroid ? "android" : isIOS ? "ios" : "web",
        userAgent,
        type: clickType,
        targetId: clickTargetId,
        targetLabel: libelleSuivi(clickTargetLabel, codeParrainage),
      });

      // 3. Lancement de la redirection vers l'application. Le code de
      // parrainage suit (?ref=) : l'appli le garde jusqu'à l'inscription.
      // ⚠️ Appli absente : le passage par le store le perd, le filleul
      // doit saisir le code lui-même (il figure dans le message partagé).
      const deepLink = lienAppli(appSchema, appPath, codeParrainage);

      setStatus("Ouverture de l'application…");
      window.location.href = deepLink;

      // 4. Fallback vers les stores (Le timer démarre ICI, après l'API)
      setTimeout(() => {
        if (document.hidden || document.visibilityState === "hidden") {
          return; // L'app s'est ouverte avec succès
        }

        setStatus("Redirection vers le téléchargement de l'application…");

        if (isAndroid) {
          window.location.href =
            process.env.NEXT_PUBLIC_PLAY_STORE_LINK ||
            "https://play.google.com/store/apps/details?id=com.chickennation.app";
        } else if (isIOS) {
          window.location.href =
            process.env.NEXT_PUBLIC_APP_STORE_LINK ||
            "https://apps.apple.com/ci/app/chicken-nation/id6745905607";
        } else {
          window.location.href = "https://chicken-nation.com/app-mobile";
        }
      }, 2500);
    };

    // Exécution de la fonction
    processRedirect();

    // Note: On ne met les dépendances que sur les identifiants pour éviter de relancer l'effet
  }, [
    searchParams.get("category"),
    searchParams.get("product"),
    searchParams.get("order"),
    searchParams.get("voucher"),
    searchParams.get("loyalty"),
    searchParams.get("nation-card"),
    searchParams.get("to"),
    searchParams.get("ref"),
  ]);

  return { status, itemName };
};
