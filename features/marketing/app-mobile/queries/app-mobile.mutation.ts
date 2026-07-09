import { useMutation } from "@tanstack/react-query";
import { appMobileAPI } from "../app-mobile.api";
import { AppClickBody } from "../app-mobile.types";

/**
 * 🔍 MUTATION : Vérifier un code promo (au clic sur "Appliquer")
 * On utilise useMutation car c'est une action déclenchée par l'utilisateur
 */
export const useAppClickMutation = () => {
    return useMutation({
        mutationFn: (data: AppClickBody) => appMobileAPI.appClick(data),
        // Le clic est déclenché en fire-and-forget : on logge au moins l'échec
        // (réseau/CORS) pour ne plus avoir de panne silencieuse comme lors de la
        // migration API (le site tapait l'ancien hôte mort sans aucune trace).
        onError: (error) => {
            console.error("[deeplink] échec de l'enregistrement du clic:", error);
        },
    });
};