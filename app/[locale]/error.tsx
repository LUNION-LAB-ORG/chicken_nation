"use client";

/**
 * Erreur pendant l'affichage d'une page. Cette page remplace aussi l'en-tête
 * et le pied de page (elle entoure la mise en page publique) : elle porte donc
 * elle-même les liens utiles et le numéro de commande par téléphone.
 * Couleurs écrites en valeurs fixes : elle ne dépend d'aucun thème.
 */
export default function PageErreur({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFCF7] px-4 py-16 text-[#2A1608]">
      <div className="w-full max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#A84300]">
          CHICKEN NATION
        </p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">
          Une erreur est survenue
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#6B4A33]">
          La page n&apos;a pas pu s&apos;afficher. Réessayez dans un
          instant&nbsp;; si le problème continue, appelez-nous au{" "}
          <a
            className="whitespace-nowrap font-semibold text-[#A84300] underline"
            href="tel:+2252721712130"
          >
            27 21 71 21 30
          </a>
          .
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-[#6B4A33]">
            Référence de l&apos;erreur&nbsp;: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            className="min-h-11 rounded-full bg-[#FD8127] px-6 font-semibold text-[#2A1608] hover:bg-[#EE6E12]"
            type="button"
            onClick={() => retry()}
          >
            Réessayer
          </button>
          {/* Lien complet (et non le routeur) : repart d'une page saine. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- rechargement complet voulu après une erreur */}
          <a
            className="inline-flex min-h-11 items-center rounded-full border border-[#D9C4AE] bg-white px-6 font-semibold"
            href="/fr"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </div>
  );
}
