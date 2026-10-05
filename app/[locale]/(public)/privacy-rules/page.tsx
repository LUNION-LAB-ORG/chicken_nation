import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../meta";

import { TexteLong } from "@/components/site/TexteLong";
import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

export const metadata = pageMetadata({
  chemin: "/privacy-rules",
  titre: "Politique de confidentialité",
  description:
    "Quelles données l'application CHICKEN NATION collecte, pourquoi, et comment exercer vos droits sur vos données personnelles.",
});

// Contenu juridique repris tel quel de l'ancienne page (seules la typographie
// et la mise en page changent). La fiche de l'application dans les stores
// pointe vers cette adresse : elle ne change pas.
export default async function PolitiqueConfidentialite({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <TexteLong
      fondEntete="jaune"
      // Date du dernier changement du texte (commit e990f3c « maj policy »), et non celle de la
      // construction : chaque déploiement la changeait.
      miseAJour={`Dernière mise à jour${INSECABLE}: 5${INSECABLE}mars${INSECABLE}2026`}
      surtitre="Application CHICKEN NATION"
      titre="Politique de confidentialité"
    >
      <h2>1. Introduction</h2>
      <p>
        Bienvenue sur l&apos;application mobile Chicken Nation, éditée et gérée
        par TURBO DELIVERY SARL. La protection de vos données personnelles est
        une priorité absolue pour nous.
      </p>
      <p>
        Cette politique de confidentialité vise à vous informer de manière
        transparente sur la façon dont nous collectons, utilisons, partageons et
        protégeons vos informations personnelles lorsque vous utilisez notre
        application pour passer une commande.
      </p>

      <h2>2. Données collectées</h2>
      <p>
        Pour vous fournir nos services et traiter vos commandes, nous collectons
        les types d&apos;informations suivants{INSECABLE}:
      </p>
      <ul>
        <li>
          <strong>Données d&apos;identification{INSECABLE}:</strong> nom et
          prénom.
        </li>
        <li>
          <strong>Profil (optionnel){INSECABLE}:</strong> image de profil et
          carte étudiant (Carte de la Nation des étudiants).
        </li>
        <li>
          <strong>Coordonnées{INSECABLE}:</strong> numéro de téléphone et
          adresse e-mail.
        </li>
        <li>
          <strong>Adresse de livraison{INSECABLE}:</strong> adresse physique ou
          position géographique (si applicable).
        </li>
        <li>
          <strong>Informations de paiement{INSECABLE}:</strong> traitées de
          manière sécurisée par nos prestataires de services de paiement.
        </li>
        <li>
          <strong>Données d&apos;utilisation{INSECABLE}:</strong> historique des
          commandes et préférences alimentaires.
        </li>
      </ul>

      <h2>3. Finalités de la collecte</h2>
      <p>
        Les données personnelles que nous collectons sont utilisées pour
        {INSECABLE}:
      </p>
      <ul>
        <li>Le traitement, la préparation et la livraison de vos commandes.</li>
        <li>
          La communication avec vous concernant votre commande ou pour le
          service client.
        </li>
        <li>
          L&apos;amélioration de nos services et de votre expérience
          utilisateur.
        </li>
        <li>Le respect de nos obligations légales et réglementaires.</li>
      </ul>

      <h2>4. Partage des données</h2>
      <p>
        Nous ne vendons, ne louons ni ne partageons vos données avec des tiers à
        des fins commerciales. Cependant, nous pouvons les partager avec
        {INSECABLE}:
      </p>
      <ul>
        <li>
          <strong>Nos partenaires de livraison{INSECABLE}:</strong> pour vous
          faire parvenir votre commande.
        </li>
        <li>
          <strong>Nos prestataires de services de paiement{INSECABLE}:</strong>{" "}
          pour sécuriser vos transactions.
        </li>
        <li>
          <strong>Les autorités compétentes{INSECABLE}:</strong> uniquement si
          requis par la loi.
        </li>
      </ul>

      <h2>5. Sécurité des données</h2>
      <p>
        Nous mettons en place des mesures techniques et organisationnelles
        appropriées pour protéger vos données contre tout accès non autorisé,
        altération, divulgation ou destruction.
      </p>

      <h2>6. Conservation et suppression (vos droits)</h2>
      <p>
        Nous conservons vos données tant que votre compte est actif. Vous
        disposez du droit de demander la suppression totale de votre compte et
        de vos données à tout moment depuis l&apos;application (Paramètres &gt;
        Supprimer mon compte) ou par e-mail.
      </p>
      <ul>
        <li>Droit d&apos;accès et de rectification.</li>
        <li>Droit à l&apos;effacement (droit à l&apos;oubli).</li>
        <li>Droit à la portabilité des données.</li>
      </ul>

      <h2>7. Contact</h2>
      <p>
        Pour toute question concernant cette politique ou pour exercer vos
        droits, contactez-nous{INSECABLE}:
      </p>
      <ul>
        <li>
          <strong>E-mail client{INSECABLE}:</strong>{" "}
          <a href="mailto:info@chicken-nation.com">info@chicken-nation.com</a>
        </li>
        <li>
          <strong>E-mail technique{INSECABLE}:</strong>{" "}
          <a href="mailto:support@lunion-lab.com">support@lunion-lab.com</a>
        </li>
        <li>
          <strong>Téléphone{INSECABLE}:</strong>{" "}
          <a className="whitespace-nowrap" href={telLien()}>
            +225 {TELEPHONE}
          </a>
        </li>
        <li>
          <strong>Site web{INSECABLE}:</strong>{" "}
          <a href="https://www.chicken-nation.com/fr">www.chicken-nation.com</a>
        </li>
      </ul>
    </TexteLong>
  );
}
