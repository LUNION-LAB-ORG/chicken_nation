import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";

import AdhesionForm from "@/components/(public)/common/carte-nation/AdhesionForm";
import NationCardVisual from "@/components/(public)/common/carte-nation/NationCardVisual";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("carte-nation.adhesion");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

/**
 * Page d'adhésion — REFONTE « identité CN » (plus de carte générique centrée) :
 * à gauche le PITCH avec le visuel de la carte (l'objet qu'on demande) et les
 * bénéfices ; à droite le formulaire. Codes de la marque : font-title
 * majuscules orange, jaune secondary, rayures diagonales des bannières.
 */
export default async function CarteNationAdhesionPage() {
  const t = await getTranslations("carte-nation.adhesion");

  const benefits = [t("benefit_free"), t("benefit_whatsapp"), t("benefit_app")];

  return (
    <section className="relative overflow-hidden bg-[#FFF8F0]">
      {/* Liseré rayé signature en haut de page */}
      <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#ff6200,#ff6200_16px,#ffc700_16px,#ffc700_32px)]" />

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_minmax(0,520px)] lg:gap-16">
          {/* ── Colonne pitch ── */}
          <div className="lg:sticky lg:top-24">
            <span className="inline-block -rotate-2 rounded-lg bg-secondary px-3 py-1.5 font-title text-sm font-bold uppercase tracking-widest text-black shadow-[3px_3px_0_0_#ff6200]">
              {t("hero_badge")}
            </span>

            <h1 className="mt-5 font-title text-4xl font-bold uppercase leading-[0.95] tracking-wide text-[#ff6200] sm:text-5xl xl:text-6xl">
              {t("hero_title")}
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-neutral-600">
              {t("hero_subtitle")}
            </p>

            {/* Le visuel de la carte — l'objet de la demande */}
            <div className="mt-10 max-w-md">
              <NationCardVisual
                cardLabel={t("card_label")}
                memberLabel={t("card_member")}
              />
            </div>

            {/* -20% + bénéfices */}
            <div className="mt-10 space-y-3">
              <p className="font-title text-2xl uppercase tracking-wide text-neutral-900">
                {t("pitch_title")}
                <span className="ml-2 align-middle font-sans text-sm font-normal normal-case tracking-normal text-neutral-500">
                  {t("pitch_sub")}
                </span>
              </p>
              <ul className="space-y-2.5">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-black shadow-[2px_2px_0_0_rgba(255,98,0,0.35)]">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-medium text-neutral-700">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Colonne formulaire ── */}
          <div>
            <AdhesionForm />
          </div>
        </div>
      </div>
    </section>
  );
}
