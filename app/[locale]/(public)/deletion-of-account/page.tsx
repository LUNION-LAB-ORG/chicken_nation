import Content from "./content";
import { pageMetadata } from "../../meta";
import { setRequestLocale } from "next-intl/server";

export const metadata = pageMetadata({
  chemin: "/deletion-of-account",
  titre: "Supprimer mon compte",
  description:
    "Comment supprimer votre compte CHICKEN NATION et les données personnelles qui y sont liées.",
});

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Content />;
}
