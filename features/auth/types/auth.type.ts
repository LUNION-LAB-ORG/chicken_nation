import { IUtilisateur } from "@/features/utilisateur/types/utilisateur.type";

export interface ILoginResponse {
  user: IUtilisateur;
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshTokenResponse {
  accessToken: string;
}
