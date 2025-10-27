import { LoginDTO } from "../schemas/auth.schema";
import { ILoginResponse, IRefreshTokenResponse } from "../types/auth.type";
import { api } from "@/lib/api";

export interface IAuthAPI {
  login: (data: LoginDTO) => Promise<ILoginResponse>;
  refreshToken: (token: string) => Promise<IRefreshTokenResponse>;
}

export const authAPI: IAuthAPI = {
  login(data: LoginDTO): Promise<ILoginResponse> {
    return api.request<ILoginResponse>({
      endpoint: `/auth/signin`,
      method: "POST",
      data,
      service: "public"
    });
  },

  refreshToken(token: string): Promise<IRefreshTokenResponse> {
    return api.request<IRefreshTokenResponse>({
      endpoint: `/auth/refresh`,
      method: "GET",
      service: "public",
      config: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  },
};
