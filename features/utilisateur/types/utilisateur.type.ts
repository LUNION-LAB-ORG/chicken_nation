export enum UtilisateurRole {
  AGENT = "AGENT",
  ADMIN = "ADMIN",
}

export enum UtilisateurStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DELETED = "DELETED",
}

export interface IUtilisateur {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UtilisateurRole;
  status: UtilisateurStatus;
  isPasswordChangeRequired: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface IUtilisateursParams {
  status?: UtilisateurStatus;
  role?: UtilisateurRole;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  page?: number;
  limit?: number;
}

export interface IUtilisateurAddUpdateResponse extends Pick<IUtilisateur,
  'id' | 'email' | 'firstName' | 'lastName' | 'phoneNumber' | 'role' | 'status'
  | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isPasswordChangeRequired'> {
  generatedPassword: string
}

export interface IUtilisateurDeleteResponse {
  success: true,
  message: string,
};