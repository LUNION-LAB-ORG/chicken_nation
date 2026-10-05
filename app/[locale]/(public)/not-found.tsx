import type { Metadata } from "next";

import { Link } from "@/i18n/navigation";

// Next ajoute lui-même `noindex` à toute réponse 404.
export const metadata: Metadata = {
  title: "Page introuvable",
};

/**
 * Page 404 des pages publiques, avec l'en-tête et le pied de page. Elle sert
 * aux adresses inconnues (reprise telle quelle par app/global-not-found.tsx)
 * et à tout notFound() appelé par une page.
 * Version provisoire : habillée au nouveau design au lot L5.
 */
export default function PageIntrouvable() {
  return (
    <section className="flex flex-1 items-center justify-center bg-[#FFFCF7] px-4 pb-20 pt-32 text-[#2A1608]">
      <div className="w-full max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#A84300]">
          Erreur 404
        </p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">
          Page introuvable
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#6B4A33]">
          Cette adresse ne mène à aucune page. Elle a peut-être changé, ou le
          lien contient une erreur.
        </p>
        <nav
          aria-label="Pages utiles"
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          {/* Ancienne carte, redirigée vers /carte dès que la nouvelle existe (lot L7). */}
          <Link
            className="inline-flex min-h-11 items-center rounded-full bg-[#FD8127] px-6 font-semibold text-[#2A1608] hover:bg-[#EE6E12]"
            href="/restaurants/nos-menus"
          >
            Voir le menu
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-[#D9C4AE] bg-white px-6 font-semibold"
            href="/restaurants"
          >
            Nos restaurants
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-[#D9C4AE] bg-white px-6 font-semibold"
            href="/"
          >
            Retour à l&apos;accueil
          </Link>
        </nav>
        <p className="mt-8 text-sm text-[#6B4A33]">
          Une question&nbsp;? Appelez-nous au{" "}
          <a
            className="whitespace-nowrap font-semibold text-[#A84300] underline"
            href="tel:+2252721712130"
          >
            27 21 71 21 30
          </a>
          .
        </p>
      </div>
    </section>
  );
}
