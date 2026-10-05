/**
 * Après « Se déconnecter » ou « Changer de compte », le bouton disparaît et
 * le formulaire de connexion prend sa place : sans cela, le focus retombait
 * en haut de la page. Le geste est noté ici, et le prochain formulaire de
 * connexion affiché donne le focus à son champ (une seule fois).
 */
let demande = false;

export function demanderFocusConnexion() {
  demande = true;
}

/** Vrai une seule fois après une demande. */
export function prendreFocusConnexion(): boolean {
  const d = demande;

  demande = false;

  return d;
}
