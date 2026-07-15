import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import AdhesionForm from "@/components/(public)/common/carte-nation/AdhesionForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("carte-nation.adhesion");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function CarteNationAdhesionPage() {
  const t = await getTranslations("carte-nation.adhesion");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-16 px-4 md:py-24">
      <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <span className="text-xl">🍗</span>
            <span className="text-sm font-semibold text-primary">
              {t("hero_badge")}
            </span>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
            {t("hero_title")}
          </h1>
          <p className="mx-auto max-w-lg text-base text-default-500">
            {t("hero_subtitle")}
          </p>
        </div>

        <AdhesionForm />
      </div>
    </section>
  );
}
