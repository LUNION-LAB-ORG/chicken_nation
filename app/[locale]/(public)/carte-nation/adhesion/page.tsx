import type { Metadata } from "next";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../../meta";

import AdhesionForm from "@/components/site/carte-nation/AdhesionForm";
import NationCardVisual from "@/components/site/carte-nation/NationCardVisual";
import { Icone } from "@/components/site/Icone";
import { Section } from "@/components/site/Section";
import { EntetePage } from "@/components/site/TexteLong";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // Langue passée explicitement : sans elle, next-intl lirait les en-têtes et
  // la page ne serait plus pré-construite.
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "carte-nation.adhesion",
  });

  return pageMetadata({
    chemin: "/carte-nation/adhesion",
    titre: t("meta_title"),
    description: t("meta_description"),
  });
}

/**
 * Demande de Carte de la Nation : en-tête, puis le formulaire (en premier sur
 * téléphone, pour qu'il ne soit pas enterré sous la présentation) et la carte
 * avec ce qu'elle apporte, selon les faits de la retouche 2 seulement.
 */
export default async function CarteNationAdhesionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);
  const t = await getTranslations("carte-nation.adhesion");

  const avantages = [
    t("benefit_free"),
    t("benefit_validation"),
    t("benefit_app"),
  ];

  return (
    <>
      <EntetePage
        surtitre={t("hero_badge")}
        titre={t("hero_title")}
        titreId="titre-adhesion"
      >
        <p>{t("hero_subtitle")}</p>
      </EntetePage>

      <Section
        motif
        classeConteneur="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-14"
        fond="surface"
        libelle={t("title")}
      >
        {/* Formulaire : premier dans la page, colonne de droite sur ordinateur. */}
        <div className="rounded-panneau border border-trait bg-white p-4 shadow-1 min-[360px]:p-5 md:p-7 lg:col-start-2 lg:row-start-1">
          <AdhesionForm />
        </div>

        <div className="grid gap-8 lg:col-start-1 lg:row-start-1 lg:pt-4">
          <NationCardVisual
            cardLabel={t("card_label")}
            className="mx-auto w-[min(320px,86%)] lg:mx-0"
            memberLabel={t("card_member")}
          />
          <div className="grid gap-3">
            <h2 className="text-[clamp(22px,4vw,28px)] leading-tight font-extrabold">
              {t("pitch_title")}
            </h2>
            <p className="text-encre-doux">{t("pitch_sub")}</p>
            <ul className="mt-1 grid gap-2.5">
              {avantages.map((avantage) => (
                <li key={avantage} className="flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-jaune text-encre">
                    <Icone className="size-4" nom="coche" />
                  </span>
                  <span className="pt-0.5 font-medium">{avantage}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1 text-sm font-semibold">{t("student_note")}</p>
          </div>
        </div>
      </Section>
    </>
  );
}
