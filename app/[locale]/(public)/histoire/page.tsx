import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../meta";

import { AppelCarte } from "@/components/site/histoire/AppelCarte";
import { Atouts } from "@/components/site/histoire/Atouts";
import { EnteteHistoire } from "@/components/site/histoire/EnteteHistoire";
import { Equipe } from "@/components/site/histoire/Equipe";
import { Franchise } from "@/components/site/histoire/Franchise";
import { Origine } from "@/components/site/histoire/Origine";
import { SavoirFaire } from "@/components/site/histoire/SavoirFaire";
import { Valeurs } from "@/components/site/histoire/Valeurs";
import { filArianeSchemaOrg } from "@/lib/seo/fil-ariane";
import { jsonLd } from "@/lib/seo/commun";
import { INSECABLE } from "@/lib/typo";

export const metadata = pageMetadata({
  chemin: "/histoire",
  titre: "Notre histoire et la franchise",
  description: `Née de la passion du poulet de qualité, CHICKEN NATION sert un poulet 100${INSECABLE}% local et halal à Abidjan. Notre histoire, nos valeurs et la franchise.`,
});

/**
 * Notre histoire, avec la franchise (section #franchise, cible de l'ancienne
 * adresse /fr/franchise). Page statique, sans donnée de l'API ; seul le
 * formulaire de demande de franchise est un îlot client.
 */
export default async function PageHistoire({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            filArianeSchemaOrg([
              { nom: "Notre histoire", chemin: "/fr/histoire" },
            ]),
          ),
        }}
        type="application/ld+json"
      />
      <EnteteHistoire />
      <Origine />
      <Valeurs />
      <SavoirFaire />
      <Equipe />
      <Atouts />
      <Franchise />
      <AppelCarte />
    </>
  );
}
