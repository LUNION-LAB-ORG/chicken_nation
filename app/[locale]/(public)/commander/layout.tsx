/**
 * Mise en page des écrans de la commande : rien de plus que la mise en page
 * publique. Les notifications HeroUI (ToastProvider, environ 145 ko gzip avec
 * framer-motion) sont parties au lot L11c : plus rien ne les appelle, les
 * messages passent par MessageFlottant. Fichier à retirer au lot L13 (les
 * types de routes de `.next` le citent jusqu'à la prochaine construction).
 */
export default function CommanderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
