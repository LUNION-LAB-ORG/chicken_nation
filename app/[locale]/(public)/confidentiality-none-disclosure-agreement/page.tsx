import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../meta";

import { TexteLong } from "@/components/site/TexteLong";
import { INSECABLE } from "@/lib/typo";

// Document sans rapport avec la restauration (reprise d'un EHPAD) : gardé à
// son adresse en attendant l'avis de l'utilisateur, mais hors des moteurs de
// recherche (noindex) et hors du sitemap (plan, 7.3).
export const metadata = pageMetadata({
  chemin: "/confidentiality-none-disclosure-agreement",
  titre: "Engagement de confidentialité",
  description:
    "Engagement de confidentialité et de non-divulgation de CHICKEN NATION.",
  indexable: false,
});

// Contenu repris tel quel de l'ancienne page (seules la typographie et la mise
// en page changent).
export default async function EngagementConfidentialite({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <TexteLong
      fondEntete="jaune"
      miseAJour="#1"
      titre="Engagement de confidentialité et de non divulgation"
    >
      <p>
        Je soigné(e),
        ................................................................
        représentant de la personne morale ou physique désignée ci-après
        {INSECABLE}:
      </p>

      <div className="grid gap-2 rounded-carte border border-trait-fort p-4 md:p-5">
        <p>Nom{INSECABLE}:</p>
        <p>Dénomination sociale{INSECABLE}:</p>
        <p>Forme juridique{INSECABLE}:</p>
        <p>Adresse{INSECABLE}:</p>
      </div>

      <p>
        Accepte et reconnais que tous les droits relatifs à l&apos;INFORMATION
        qui m&apos;est divulguée et communiquée dans le cadre de la reprise de
        l&apos;autorisation de l&apos;EHPAD «{INSECABLE}Les Trois Sources
        {INSECABLE}», par le biais des autorités de tarification et de contrôle,
        l&apos;Agence Régionale de Santé (ARS) et le Conseil départemental,
        appartiennent en tant qu&apos;entière et seule propriété de l&apos;EHPAD
        «{INSECABLE}Les Trois Sources{INSECABLE}», LE CONCEDANT.
      </p>
      <p>
        J&apos;accepte de considérer l&apos;INFORMATION comme confidentielle.
      </p>
      <p>Je m&apos;engage à ne pas divulguer l&apos;INFORMATION.</p>
      <p>
        Je reconnais que les données écrites sont et resteront la propriété du
        CONCEDANT et que de telles données écrites ne peuvent être copiées ou
        reproduites sans l&apos;autorisation écrite expresse et préalable de ce
        dernier. Toutes les copies de telles données écrites devront être
        restituées dans les 8{INSECABLE}jours suivant toute demande des
        autorités de tarification et de contrôle.
      </p>
      <p>
        Je m&apos;engage à apporter à l&apos;INFORMATION tous les soins
        nécessaires et au minimum ceux appliqués à mes propres informations
        ayant une importance équivalente, de manière à éviter une publication,
        une divulgation non-autorisée de l&apos;INFORMATION, ou un usage de
        celle-ci autre que le cadre de la reprise de l&apos;EHPAD.
      </p>
      <p>
        Je m&apos;engage, dans l&apos;hypothèse où il s&apos;avère indispensable
        de divulguer à des tiers l&apos;information ou une partie de
        l&apos;information, à demander au CONCEDANT une autorisation écrite
        préalable mentionnant les Tiers concernés et l&apos;information à
        divulguer.
      </p>
      <p>
        Une information ne bénéficie pas de la protection conférée par le
        présent «{INSECABLE}ENGAGEMENT{INSECABLE}» si à la date de celui-ci,
        cette information était déjà{INSECABLE}:
      </p>
      <ul>
        <li>
          Obtenue par le Bénéficiaire d&apos;une partie Tiers, licitement est
          sans restriction.
        </li>
        <li>
          Disponible publiquement autrement que du fait de la faute ou de la
          négligence du Bénéficiaire.
        </li>
      </ul>
      <p>
        Le Bénéficiaire s&apos;engage à informer l&apos;ARS et le Conseil
        départemental sans délai et par écrit de tout événement pouvant survenir
        selon les dispositions du présent paragraphe.
      </p>
      <p>
        Si une quelconque partie de l&apos;information tombe dans une des
        exceptions mentionnées ci-dessus, l&apos;information restante continuera
        à bénéficier de la protection du présent Engagement.
      </p>
      <p>
        La communication de l&apos;Information par l&apos;ARS et le Conseil
        départemental au Bénéficiaire n&apos;implique aucun droit de cession de
        quelconque droit de Propriété Intellectuelle, ou de cession
        d&apos;office de l&apos;autorisation d&apos;exploitation de l&apos;EHPAD
        «{INSECABLE}Les Trois Sources{INSECABLE}».
      </p>

      <p className="text-sm italic">
        Nb{INSECABLE}: L&apos;accord de confidentialité une fois signé, prévaut
        sur toute clause de conditions générales.
      </p>
      <p>Fait à .................., le .................</p>
      <div className="grid gap-1">
        <p>Nom{INSECABLE}:</p>
        <p>Signature{INSECABLE}:</p>
      </div>
    </TexteLong>
  );
}
