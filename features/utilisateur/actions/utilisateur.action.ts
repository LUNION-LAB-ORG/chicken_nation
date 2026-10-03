"use server";

import { ActionResponse, PaginatedResponse } from "@/types/api.type";
import { utilisateurAPI } from "../apis/utilisateur.api";
import { UtilisateurAddDTO, UtilisateurUpdateDTO } from "../schema/utilisateur.schema";
import { IUtilisateur, IUtilisateurDeleteResponse, IUtilisateursParams } from "../types/utilisateur.type";
import { handleServerActionError } from "@/utils/handleServerActionError";
import { exigerSessionPersonnel } from "@/lib/api.server";

// Chaque action commence par exigerSessionPersonnel() : une action serveur
// s'appelle par POST direct, sans passer par la page protégée. Sans session,
// refus immédiat, aucun appel à l'API.

export const obtenirTousUtilisateursAction = async (params: IUtilisateursParams): Promise<ActionResponse<PaginatedResponse<IUtilisateur>>> => {
    const session = await exigerSessionPersonnel();
    if (!session.ok) return session.refus;
    try {
        const data = await utilisateurAPI.obtenirTousUtilisateurs(session.client, params);
        return {
            success: true,
            data: data,
            message: "Utilisateurs obtenus avec succès",
        }
    } catch (error) {
        return handleServerActionError(error, "Erreur lors de la récupération des utilisateurs");
    }
}

export const obtenirUnUtilisateurAction = async (id: string): Promise<ActionResponse<IUtilisateur>> => {
    const session = await exigerSessionPersonnel();
    if (!session.ok) return session.refus;
    try {
        const data = await utilisateurAPI.obtenirUtilisateur(session.client, id);
        return {
            success: true,
            data: data,
            message: "Utilisateur obtenu avec succès",
        }
    } catch (error) {
        return handleServerActionError(error, "Erreur lors de la récupération de l'utilisateur");
    }
}

export const ajouterUtilisateurAction = async (formdata: UtilisateurAddDTO): Promise<ActionResponse<IUtilisateur>> => {
    const session = await exigerSessionPersonnel();
    if (!session.ok) return session.refus;
    try {
        const data = await utilisateurAPI.ajouterUtilisateur(session.client, formdata);
        return {
            success: true,
            data: data,
            message: "Utilisateur ajoute avec succès",
        }
    } catch (error) {
        return handleServerActionError(error, "Erreur lors de l'ajout de l'utilisateur");
    }
}

export const modifierProfilAction = async (id: string, formdata: UtilisateurUpdateDTO): Promise<ActionResponse<IUtilisateur>> => {
    const session = await exigerSessionPersonnel();
    if (!session.ok) return session.refus;
    try {
        const data = await utilisateurAPI.modifierProfil(session.client, id, formdata);
        return {
            success: true,
            data: data,
            message: "Profil modifie avec succès",
        }
    } catch (error) {
        return handleServerActionError(error, "Erreur lors de la modification du profil");
    }
}

export const supprimerUtilisateurAction = async (id: string): Promise<ActionResponse<IUtilisateurDeleteResponse>> => {
    const session = await exigerSessionPersonnel();
    if (!session.ok) return session.refus;
    try {
        const data = await utilisateurAPI.supprimerUtilisateur(session.client, id);
        return {
            success: true,
            data: data,
            message: "Utilisateur supprime avec succès",
        }
    } catch (error) {
        return handleServerActionError(error, "Erreur lors de la suppression de l'utilisateur");
    }
}
