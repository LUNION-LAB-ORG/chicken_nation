import { unstable_isUnrecognizedActionError } from "next/navigation";

/**
 * Message à afficher quand l'APPEL d'une action serveur échoue côté navigateur
 * (les erreurs de l'API, elles, reviennent dans le résultat de l'action) :
 *  - réseau coupé, ou réponse illisible pendant un redéploiement ;
 *  - action inconnue du serveur : la page a été chargée avant un redéploiement
 *    et ses identifiants d'actions ne correspondent plus. Réessayer ne sert à
 *    rien, il faut recharger la page.
 * Sans ce filet, le bouton restait en chargement sans aucun message.
 */
export const MESSAGE_PAGE_PERIMEE = "La page a été mise à jour, rechargez-la.";
export const MESSAGE_CONNEXION_PERDUE = "Connexion perdue. Réessayez.";

export const actionPerimee = (e: unknown) =>
  unstable_isUnrecognizedActionError(e);

export const messageErreurAction = (e: unknown) =>
  actionPerimee(e) ? MESSAGE_PAGE_PERIMEE : MESSAGE_CONNEXION_PERDUE;
