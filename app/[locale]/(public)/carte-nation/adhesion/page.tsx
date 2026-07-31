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
 * Page d'adhésion — identité CN (Blocklyn majuscules orange, jaune secondary,
 * rayures signature) sur FOND BLANC.
 *
 * Ordre MOBILE pensé conversion : en-tête → FORMULAIRE → carte + bénéfices
 * (le formulaire ne doit pas être enterré sous le pitch). Sur desktop, le
 * pitch occupe la colonne gauche (en-tête + carte) et le formulaire la droite
 * — obtenu par grid à 3 enfants placés explicitement (l'ordre du source =
 * l'ordre mobile).
 */
export default async function CarteNationAdhesionPage() {
  const t = await getTranslations("carte-nation.adhesion");

  const benefits = [t("benefit_free"), t("benefit_whatsapp"), t("benefit_app")];

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Liseré rayé signature en haut de page */}
      <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#ff6200,#ff6200_16px,#ffc700_16px,#ffc700_32px)]" />

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-20">
        <div className="lg:grid lg:grid-cols-[1fr_minmax(0,520px)] lg:grid-rows-[auto_1fr] lg:gap-x-16">
          {/* ── A. En-tête (badge + titre + sous-titre) ── */}
          <div className="lg:col-start-1 lg:row-start-1">
            <span className="inline-block -rotate-2 rounded-lg bg-secondary px-3 py-1.5 font-title text-sm font-bold uppercase tracking-widest text-black shadow-[3px_3px_0_0_#ff6200]">
              {t("hero_badge")}
            </span>

            <h1 className="mt-5 font-title text-4xl font-bold uppercase leading-[0.95] tracking-wide text-[#ff6200] sm:text-5xl xl:text-6xl">
              {t("hero_title")}
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-neutral-600">
              {t("hero_subtitle")}
            </p>
          </div>

          {/* ── C. Formulaire — JUSTE après l'en-tête sur mobile ── */}
          <div className="mt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0">
            <AdhesionForm />
          </div>

          {/* ── B. Carte + bénéfices — sous le formulaire sur mobile ── */}
          <div className="mt-12 lg:col-start-1 lg:row-start-2 lg:mt-10">
            <div className="max-w-md">
              <NationCardVisual
                cardLabel={t("card_label")}
                memberLabel={t("card_member")}
              />
            </div>

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
        </div>
      </div>
    </section>
  );
}
