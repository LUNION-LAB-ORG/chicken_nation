/**
 * Fenêtres (<dialog>) ouvertes, dans l'ordre d'ouverture. La dernière est au
 * premier plan : le message flottant s'y affiche. Tant qu'il en reste une,
 * la page ne défile plus dessous (classe « fige » sur <html>).
 */
const pile: HTMLDialogElement[] = [];

function majPage() {
  document.documentElement.classList.toggle("fige", pile.length > 0);
}

export function fenetreOuverte(fenetre: HTMLDialogElement) {
  if (!pile.includes(fenetre)) pile.push(fenetre);
  majPage();
}

export function fenetreFermee(fenetre: HTMLDialogElement) {
  const i = pile.indexOf(fenetre);

  if (i !== -1) pile.splice(i, 1);
  majPage();
}

export function fenetreDuDessus(): HTMLDialogElement | null {
  return pile[pile.length - 1] ?? null;
}
