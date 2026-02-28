import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppClickMutation } from "@/features/marketing/app-mobile/queries/app-mobile.mutation";
import { appSchema } from "@/config/api";
import { useDishOneMutation } from "@/features/menus/queries/dish.mutation";
import { useCategoryOneMutation } from "@/features/menus/queries/category/category.mutation";

export const useDeepLinkRedirect = () => {
    const searchParams = useSearchParams();

    // On extrait mutate pour le tracking
    const { mutate: mutateAppClick } = useAppClickMutation();

    // 💡 On extrait mutateAsync pour pouvoir faire des "await"
    const { mutateAsync: getDishAsync } = useDishOneMutation();
    const { mutateAsync: getCategoryAsync } = useCategoryOneMutation();

    const [status, setStatus] = useState("Préparation de la redirection...");
    const [itemName, setItemName] = useState("");

    useEffect(() => {
        // L'astuce : créer une fonction async interne
        const processRedirect = async () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const isAndroid = userAgent.includes("android");
            const isIOS = /iphone|ipad|ipod/.test(userAgent);

            // 1. Tracking Analytique (Fire-and-forget)
            mutateAppClick({
                platform: isAndroid ? "android" : isIOS ? "ios" : "web",
                userAgent,
            });

            // 2. Construction de la route mobile
            let appPath = "home"; // Route par défaut
            const category = searchParams.get("category");
            const product = searchParams.get("product");
            const order = searchParams.get("order");
            const voucher = searchParams.get("voucher");
            const loyalty = searchParams.get("loyalty");
            const nationCard = searchParams.get("nation-card");

            try {
                // 💡 Utilisation de await avec mutateAsync
                if (category) {
                    setStatus("Recherche de la catégorie...");
                    const categoryData = await getCategoryAsync(category);
                    setItemName(categoryData.name);
                    appPath = `category/${categoryData.id}`;

                } else if (product) {
                    setStatus("Recherche du plat...");
                    const productData = await getDishAsync(product);
                    setItemName(productData.name);
                    appPath = `menu/${productData.id}`;

                } else if (order) {
                    setItemName(`Commande ${order}`);
                    appPath = `order/${order}`;
                } else if (voucher) {
                    setItemName("Bons et Codes Promo");
                    appPath = `vouchers`;
                } else if (loyalty) {
                    setItemName("Club de Fidélité");
                    appPath = `loyalty`;
                } else if (nationCard) {
                    setItemName("Carte de la Nation");
                    appPath = `nation-card`;
                }
            } catch (error) {
                console.error("Élément introuvable en base de données :", error);
                // Si l'API échoue (ex: produit supprimé), appPath restera "home"
                // L'utilisateur sera redirigé vers l'accueil de l'app plutôt qu'une page d'erreur
            }

            // 3. Lancement de la redirection vers l'application
            const deepLink = `${appSchema}://${appPath}`;
            setStatus("Ouverture de l'application...");
            window.location.href = deepLink;

            // 4. Fallback vers les stores (Le timer démarre ICI, après l'API)
            setTimeout(() => {
                if (document.hidden || document.visibilityState === 'hidden') {
                    return; // L'app s'est ouverte avec succès
                }

                setStatus("Redirection vers le store...");

                if (isAndroid) {
                    window.location.href = process.env.NEXT_PUBLIC_PLAY_STORE_LINK || "https://play.google.com/store/apps/details?id=com.chickennation.app";
                } else if (isIOS) {
                    window.location.href = process.env.NEXT_PUBLIC_APP_STORE_LINK || "https://apps.apple.com/ci/app/chicken-nation/id6745905607";
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
        searchParams.get("nation-card")]);

    return { status, itemName };
};