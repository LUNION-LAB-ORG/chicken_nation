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
    });
};