import Image from "next/image";

export default function ConfidentialityDocumentPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 bg-white min-h-screen">
     <header className="flex items-center justify-between mb-8 px-4 py-2">
        <div className="relative w-14 h-14 lg:w-24 lg:h-24">
          <Image
          src="/assets/images/logo.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>
      </header>

      <div className="space-y-6 px-8">
        <h1 className="text-2xl font-bold text-center mb-8">
        ENGAGEMENT DE CONFIDENTIALITÉ ET DE NON DIVULGATION
        </h1>

        <p>
          Je soigné(e),
          ................................................................
          représentant de la personne morale ou physique désignée ci-après :
        </p>

        <div className="border border-gray-300 p-6 space-y-4">
          <p>Nom :</p>
          <p>Dénomination sociale :</p>
          <p>Forme juridique :</p>
          <p>Adresse :</p>
        </div>

        <div className="space-y-4 text-justify">
          <p>
            Accepte et reconnais que tous les droits relatifs à
            l&apos;INFORMATION qui m&apos;est divulguée et communiquée dans le
            cadre de la reprise de l&apos;autorisation de l&apos;EHPAD « Les
            Trois Sources », par le biais des autorités de tarification et de
            contrôle, l&apos;Agence Régionale de Santé (ARS) et le Conseil
            départemental, appartiennent en tant qu&apos;entière et seule
            propriété de l&apos;EHPAD « Les Trois Sources », LE CONCEDANT.
          </p>

          <p>
            J&apos;accepte de considérer l&apos;INFORMATION comme
            confidentielle.
          </p>

          <p>Je m&apos;engage à ne pas divulguer l&apos;INFORMATION.</p>

          <p>
            Je reconnais que les données écrites sont et resteront la propriété
            du CONCEDANT et que de telles données écrites ne peuvent être
            copiées ou reproduites sans l&apos;autorisation écrite expresse et
            préalable de ce dernier. Toutes les copies de telles données écrites
            devront être restituées dans les 8 jours suivant toute demande des
            autorités de tarification et de contrôle.
          </p>

          <p>
            Je m&apos;engage à apporter à l&apos;INFORMATION tous les soins
            nécessaires et au minimum ceux appliqués à mes propres informations
            ayant une importance équivalente, de manière à éviter une
            publication, une divulgation non-autorisée de l&apos;INFORMATION, ou
            un usage de celle-ci autre que le cadre de la reprise de
            l&apos;EHPAD.
          </p>

          <p>
            Je m&apos;engage, dans l&apos;hypothèse où il s&apos;avère
            indispensable de divulguer à des tiers l&apos;information ou une
            partie de l&apos;information, à demander au CONCEDANT une
            autorisation écrite préalable mentionnant les Tiers concernés et
            l&apos;information à divulguer.
          </p>

          <p>
            Une information ne bénéficie pas de la protection conférée par le
            présent « ENGAGEMENT » si à la date de celui-ci, cette information
            était déjà :
          </p>

          <ul className="list-disc pl-8 space-y-2">
            <li>
              Obtenue par le Bénéficiaire d&apos;une partie Tiers, licitement
              est sans restriction.
            </li>
            <li>
              Disponible publiquement autrement que du fait de la faute ou de la
              négligence du Bénéficiaire.
            </li>
          </ul>

          <p>
            Le Bénéficiaire s&apos;engage à informer l&apos;ARS et le Conseil
            départemental sans délai et par écrit de tout événement pouvant
            survenir selon les dispositions du présent paragraphe.
          </p>

          <p>
            Si une quelconque partie de l&apos;information tombe dans une des
            exceptions mentionnées ci-dessus, l&apos;information restante
            continuera à bénéficier de la protection du présent Engagement.
          </p>

          <p>
            La communication de l&apos;Information par l&apos;ARS et le Conseil
            départemental au Bénéficiaire n&apos;implique aucun droit de cession
            de quelconque droit de Propriété Intellectuelle, ou de cession
            d&apos;office de l&apos;autorisation d&apos;exploitation de
            l&apos;EHPAD « Les Trois Sources ».
          </p>
        </div>

        <div className="mt-12 space-y-4">
          <p className="italic text-sm">
            Nb : L&apos;accord de confidentialité une fois signé, prévaut sur
            toute clause de conditions générales.
          </p>

          <div className="flex gap-4 mt-8">
            <p>Fait à .................., le .................</p>
          </div>

          <div className="space-y-2">
            <p>Nom :</p>
            <p>Signature :</p>
          </div>
        </div>

        <div className="text-right mt-8">
          <p className="text-sm">#1</p>
        </div>
      </div>
    </div>
  );
}
