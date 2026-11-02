/**
 * Limite des envois d'avis par le serveur du site, en mémoire (un seul
 * conteneur en production), sur le modèle du formulaire de contact
 * (app/api/send-email/route.ts) : 5 envois par adresse IP et 60 au total par
 * fenêtre de 15 minutes. Elle protège l'API avant même l'appel ; le serveur
 * de l'API garde ses propres barrières (doublon, 3 avis par numéro et par
 * jour, plafond global, limite par IP).
 */

export const FENETRE_AVIS_MS = 15 * 60 * 1000;
export const MAX_AVIS_PAR_IP = 5;
export const MAX_AVIS_TOTAL = 60;

const envois = new Map<string, number[]>();

/** Les clés sans envoi depuis 15 min sont oubliées : la table ne grossit pas sans fin. */
function menage(maintenant: number) {
  envois.forEach((dates, cle) => {
    if (dates.every((t) => maintenant - t >= FENETRE_AVIS_MS))
      envois.delete(cle);
  });
}

/** Vrai si la clé a atteint son maximum ; sinon l'envoi est compté. */
function depasse(cle: string, max: number, maintenant: number): boolean {
  const recents = (envois.get(cle) ?? []).filter(
    (t) => maintenant - t < FENETRE_AVIS_MS,
  );

  if (recents.length >= max) {
    envois.set(cle, recents);

    return true;
  }
  recents.push(maintenant);
  envois.set(cle, recents);

  return false;
}

/**
 * Vrai si cet envoi dépasse la limite. Sans adresse IP (nginx ne la transmet
 * pas), seule la limite totale joue : une clé commune bloquerait tous les
 * visiteurs ensemble.
 */
export function avisRefuseParLimite(
  ip: string | null,
  maintenant = Date.now(),
): boolean {
  menage(maintenant);

  return (
    (!!ip && depasse(`ip:${ip}`, MAX_AVIS_PAR_IP, maintenant)) ||
    depasse("total", MAX_AVIS_TOTAL, maintenant)
  );
}

/** Pour les tests : repart d'une table vide. */
export function oublierEnvoisAvis() {
  envois.clear();
}
