"use client";

/**
 * Erreur dans la mise en page racine elle-même : cette page remplace tout le
 * document, sans la feuille de style du site (d'où les styles écrits ici).
 * Pas de `metadata` possible dans ce fichier : le titre passe par <title>.
 */
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="fr">
      <body style={styles.corps}>
        <title>Une erreur est survenue | CHICKEN NATION</title>
        <main style={styles.bloc}>
          <p style={styles.marque}>CHICKEN NATION</p>
          <h1 style={styles.titre}>Une erreur est survenue</h1>
          <p style={styles.texte}>
            Le site n&apos;a pas pu s&apos;afficher. Réessayez dans un
            instant&nbsp;; si le problème continue, appelez-nous au{" "}
            <a href="tel:+2252721712130" style={styles.lien}>
              27 21 71 21 30
            </a>
            .
          </p>
          <div style={styles.actions}>
            <button style={styles.bouton} type="button" onClick={() => retry()}>
              Réessayer
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- rechargement complet voulu après une erreur */}
            <a href="/fr" style={styles.boutonSecondaire}>
              Retour à l&apos;accueil
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}

const styles = {
  corps: {
    margin: 0,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "64px 16px",
    boxSizing: "border-box",
    background: "#FFFCF7",
    color: "#2A1608",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  },
  bloc: { maxWidth: 520, width: "100%", textAlign: "center" },
  marque: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#A84300",
  },
  titre: { margin: "12px 0 0", fontSize: 30, lineHeight: 1.2 },
  texte: {
    margin: "16px 0 0",
    fontSize: 16,
    lineHeight: 1.6,
    color: "#6B4A33",
  },
  lien: { color: "#A84300", fontWeight: 600, whiteSpace: "nowrap" },
  actions: {
    marginTop: 32,
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  bouton: {
    minHeight: 44,
    padding: "0 24px",
    border: 0,
    borderRadius: 999,
    background: "#FD8127",
    color: "#2A1608",
    font: "inherit",
    fontWeight: 600,
    cursor: "pointer",
  },
  boutonSecondaire: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 44,
    padding: "0 24px",
    border: "1px solid #D9C4AE",
    borderRadius: 999,
    background: "#FFFFFF",
    color: "#2A1608",
    fontWeight: 600,
    textDecoration: "none",
  },
} satisfies Record<string, React.CSSProperties>;
