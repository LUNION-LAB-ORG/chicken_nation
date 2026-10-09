import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../../meta";

import { Ancre } from "@/components/site/Ancre";
import { Encadre, TexteLong } from "@/components/site/TexteLong";
import { INSECABLE } from "@/lib/typo";

/**
 * SUPPRESSION DU COMPTE CLIENT.
 *
 * ⚠️ L'ADRESSE DE CETTE PAGE EST IMPOSÉE. C'est celle déclarée dans le
 * formulaire « Data safety » de Google Play pour `com.chickennation.app`.
 * Elle renvoyait 404, et Google a exigé la correction avant le
 * 21 octobre 2026 sous peine de refuser les mises à jour de l'application.
 * Ne pas la renommer sans changer la déclaration dans la Play Console.
 *
 * ⚠️ Son nom parle de « delivery » par héritage de la déclaration d'origine,
 * mais elle concerne bien le compte CLIENT : c'est l'application cliente que
 * Google a signalée. La page des livreurs est `/fr/deletion-of-account`.
 *
 * ⚠️ Le texte décrit ce que le code fait VRAIMENT, et pas ce qu'on aimerait
 * qu'il fasse : la suppression ferme le compte (`entity_status = DELETED`,
 * téléphone libéré) mais ne détruit pas l'historique, que les obligations
 * comptables imposent de garder. Annoncer un effacement total serait faux, et
 * c'est précisément ce que Google vérifie.
 */
export const metadata = pageMetadata({
  chemin: "/request/deletion-of-delivery-account",
  titre: "Supprimer mon compte client",
  description:
    "Comment fermer votre compte client CHICKEN NATION, ce qui est supprimé et ce qui est conservé.",
});

const ETAPES = [
  "Ouvrez l'application Chicken Nation et connectez-vous",
  "Ouvrez votre profil, puis « Paramètres »",
  "Choisissez « Mon compte »",
  "Faites défiler jusqu'en bas",
  "Appuyez sur « Supprimer mon compte », puis confirmez",
];

export default async function SuppressionCompteClient({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <TexteLong
      fondEntete="jaune"
      miseAJour={`Dernière mise à jour${INSECABLE}: 9${INSECABLE}octobre${INSECABLE}2026`}
      surtitre="Supprimer mon compte"
      titre="Suppression du compte client"
    >
      <Encadre genre="alerte" titre="À savoir avant de continuer">
        <p>
          La fermeture du compte est définitive. Vos points de fidélité et votre
          Carte de la Nation sont perdus, et ils ne peuvent pas être rétablis.
          Terminez vos commandes en cours avant de demander la suppression.
        </p>
      </Encadre>

      <h2>Depuis l&apos;application</h2>
      <ol>
        {ETAPES.map((etape) => (
          <li key={etape}>{etape}</li>
        ))}
      </ol>

      <h2>Si vous n&apos;avez plus l&apos;application</h2>
      <p>
        Écrivez à{" "}
        <a
          className="inline-flex min-h-11 items-center"
          href="mailto:info@chicken-nation.com"
        >
          info@chicken-nation.com
        </a>{" "}
        depuis l&apos;adresse de votre compte, ou appelez le{" "}
        <a className="inline-flex min-h-11 items-center" href="tel:+2252721712130">
          27{INSECABLE}21{INSECABLE}71{INSECABLE}21{INSECABLE}30
        </a>{" "}
        en indiquant le numéro de téléphone du compte. Nous traitons la demande
        sous 30{INSECABLE}jours.
      </p>

      <h2>Ce qui est supprimé</h2>
      <ul>
        <li>L&apos;accès au compte : la connexion n&apos;est plus possible</li>
        <li>Votre numéro de téléphone est libéré du compte</li>
        <li>Vos préférences et vos notifications</li>
        <li>Vos points de fidélité et votre Carte de la Nation</li>
      </ul>

      <h2>Ce qui est conservé, et pourquoi</h2>
      <p>
        L&apos;historique de vos commandes et des paiements qui s&apos;y
        rattachent est conservé : nos obligations comptables et fiscales nous
        imposent de garder la trace des ventes. Ces données ne servent plus
        qu&apos;à cela, et plus jamais à vous contacter ni à vous proposer quoi
        que ce soit.
      </p>
      <p>
        Pour demander l&apos;effacement de ce qui va au-delà de ces
        obligations, écrivez-nous à{" "}
        <a
          className="inline-flex min-h-11 items-center"
          href="mailto:info@chicken-nation.com"
        >
          info@chicken-nation.com
        </a>
        .
      </p>

      <h2>Protection des données</h2>
      <p>
        Vos données sont traitées conformément à notre{" "}
        <Ancre href="/fr/privacy-rules">politique de confidentialité</Ancre> et
        aux lois en vigueur.
      </p>
    </TexteLong>
  );
}
