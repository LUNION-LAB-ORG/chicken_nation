import { setRequestLocale } from "next-intl/server";

import { ListeFaq } from "./ListeFaq";
import { faqMetadata, faqSchema, questionsFaq } from "./meta";

import { LienBouton } from "@/components/site/Bouton";
import { Section } from "@/components/site/Section";
import { COLONNE_TEXTE, EntetePage } from "@/components/site/TexteLong";
import { obtenirConfigFidelite } from "@/features/fidelite/fidelite.api";
import { jsonLd } from "@/lib/seo/commun";
import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

export { faqMetadata as metadata };

// Statique, reconstruite au plus toutes les heures (règles de fidélité lues
// dans l'API, comme le cache de `obtenirConfigFidelite`).
export const revalidate = 3600;

export default async function Faq({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);
  const rubriques = questionsFaq(await obtenirConfigFidelite());

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema(rubriques)) }}
        type="application/ld+json"
      />
      <EntetePage etroit surtitre="Questions fréquentes" titre="Vos questions">
        <p>
          Commande, livraison, paiement, fidélité et restaurants{INSECABLE}: les
          réponses aux questions qu&apos;on nous pose le plus souvent.
        </p>
      </EntetePage>
      <Section classeConteneur={COLONNE_TEXTE} libelle="Réponses">
        <ListeFaq rubriques={rubriques} />
        <div className="mt-12 grid gap-4 rounded-panneau bg-surface p-5 md:flex md:items-center md:justify-between md:p-6">
          <p className="max-w-[30em] font-medium">
            Vous ne trouvez pas votre réponse{INSECABLE}? Appelez-nous au{" "}
            <a
              className="font-bold whitespace-nowrap text-encre underline-offset-[3px] hover:underline"
              href={telLien()}
            >
              {TELEPHONE}
            </a>{" "}
            ou écrivez-nous.
          </p>
          <LienBouton className="w-fit" href="/fr/contact" variante="sombre">
            Nous écrire
          </LienBouton>
        </div>
      </Section>
    </>
  );
}
