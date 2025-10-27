import { UtilisateurStatus } from "../types/utilisateur.type";


export function getUtilisateurStatus(status: UtilisateurStatus): {
    label: string;
    color: "primary" | "default" | "secondary" | "success" | "warning" | "danger" | undefined;
} {
    switch (status) {
        case UtilisateurStatus.ACTIVE:
            return {
                label: "Actif",
                color: "success",
            };
        case UtilisateurStatus.INACTIVE:
            return {
                label: "Verrouillé",
                color: "warning",
            };
        case UtilisateurStatus.DELETED:
            return {
                label: "Supprimé",
                color: "danger",
            };
        default:
            return {
                label: "Inconnu",
                color: "default",
            };
    }
}