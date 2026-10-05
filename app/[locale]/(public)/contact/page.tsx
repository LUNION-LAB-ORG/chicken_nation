import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../meta";

import { PageContact } from "@/components/site/formulaires/PageContact";
import { INSECABLE } from "@/lib/typo";

export const metadata = pageMetadata({
  chemin: "/contact",
  titre: "Nous contacter",
  description: `Une question, une suggestion ou une réclamation${INSECABLE}? Écrivez à CHICKEN NATION ou appelez le 27${INSECABLE}21${INSECABLE}71${INSECABLE}21${INSECABLE}30.`,
});

/** Page Contact, statique ; seul le formulaire est un îlot client. */
export default async function Contact({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return <PageContact />;
}
