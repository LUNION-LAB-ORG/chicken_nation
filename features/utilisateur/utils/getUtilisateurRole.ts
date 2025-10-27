import { UtilisateurRole } from "../types/utilisateur.type";


export function getUtilisateurRole(role: UtilisateurRole): {
    label: string;
    color: "primary" | "default" | "secondary" | "success" | "warning" | "danger" | undefined;
} {
    switch (role) {
        case UtilisateurRole.AGENT:
            return {
                label: "Agent",
                color: "warning",
            };
        case UtilisateurRole.ADMIN:
            return {
                label: "Administrateur",
                color: "success",
            };
        default:
            return {
                label: "Inconnu",
                color: "default",
            };
    }
}