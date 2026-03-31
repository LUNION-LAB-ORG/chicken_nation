import { apiClient } from "@/lib/api.client";
import { AppClickBody } from "./app-mobile.types";

export const appMobileAPI = {
    appClick(data: AppClickBody) {
        return apiClient.request({
            endpoint: `/marketing/app-mobile/app-click`,
            method: "POST",
            data,
            service: "public"
        });
    },
};