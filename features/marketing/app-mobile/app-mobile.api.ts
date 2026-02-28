import { api } from "@/lib/api";
import { AppClickBody } from "./app-mobile.types";

export const appMobileAPI = {
    appClick(data: AppClickBody) {
        return api.request({
            endpoint: `/marketing/app-mobile/app-click`,
            method: "POST",
            data,
            service: "public"
        });
    },
};