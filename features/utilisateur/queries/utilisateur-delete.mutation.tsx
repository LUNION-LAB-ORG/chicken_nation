"use client";

import { addToast } from "@heroui/toast";
import {
    useMutation,
} from '@tanstack/react-query';
import { CheckCircle2, X } from "lucide-react";
import {
    supprimerUtilisateurAction
} from '../actions/utilisateur.action';
import { useInvalidateUtilisateurQuery } from './index.query';

export const useSupprimerUtilisateurMutation = () => {
    const invalidateUtilisateurQuery = useInvalidateUtilisateurQuery()
    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            if (!id) {
                throw new Error("L'identifiant de l'utilisateur est requis.");
            }
            const result = await supprimerUtilisateurAction(id)
            if (!result.success) {
                throw new Error(result.error || "Erreur lors de la suppression de l'utilisateur");
            }
            return result.data!;
        },
        onSuccess: async () => {
            addToast({
                title: "Utilisateur supprimé avec succès",
                description: "Utilisateur supprimé avec succès",
                promise: invalidateUtilisateurQuery(),
                icon: <CheckCircle2 />,
                color: "success",
            });
        },
        onError: async (error) => {
            addToast({
                title: "Erreur suppression utilisateur:",
                description: error.message,
                promise: Promise.reject(error),
                icon: <X />,
                color: "danger",
            });
        },
    });
};