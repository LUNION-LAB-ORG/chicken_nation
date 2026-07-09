import { baseURL } from "@/config/api";
import { AppClickBody } from "./app-mobile.types";

export const appMobileAPI = {
    /**
     * Enregistre le clic deeplink JUSTE avant la redirection vers le scheme app
     * (window.location.href). On utilise `fetch` + `keepalive: true` : le navigateur
     * GARANTIT l'envoi du POST même si la page navigue immédiatement après — sinon la
     * requête est annulée, surtout pour les cibles sans `await` préalable (home,
     * vouchers, loyalty, order, nation-card). Endpoint public → pas d'auth.
     */
    appClick(data: AppClickBody) {
        return fetch(`${baseURL}/marketing/deeplink/click`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            keepalive: true,
        });
    },
};
