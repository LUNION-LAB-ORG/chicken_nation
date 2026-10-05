import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../meta";

import { Ancre } from "@/components/site/Ancre";
import { Encadre, TexteLong } from "@/components/site/TexteLong";
import { INSECABLE } from "@/lib/typo";

export const metadata = pageMetadata({
  chemin: "/deletion-of-account",
  titre: "Supprimer mon compte",
  description:
    "Comment supprimer votre compte CHICKEN NATION et les données personnelles qui y sont liées.",
});

// Étapes dans l'application (Google Play exige une page publique qui les décrit).
const ETAPES = [
  "Ouvrez l'application Chicken Nation sur votre téléphone et connectez-vous si ce n'est pas encore fait",
  "Ouvrez le menu principal (icône ≡ en haut à gauche de l'écran d'accueil)",
  "Sélectionnez « Paramètres » en bas du menu",
  "Dans l'écran Paramètres, cliquez sur « Mon compte »",
  "Faites défiler vers le bas",
  "Appuyez sur « Supprimer mon compte »",
];

// Contenu repris tel quel de l'ancienne page (seules la typographie et la mise
// en page changent). Composant serveur : plus aucun JavaScript sur la page.
export default async function SuppressionCompte({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <TexteLong
      fondEntete="jaune"
      // Date du dernier changement du texte (commit 1c243c6), et non celle de la
      // construction : chaque déploiement la changeait.
      miseAJour={`Dernière mise à jour${INSECABLE}: 6${INSECABLE}août${INSECABLE}2025`}
      surtitre="Supprimer mon compte"
      titre="Suppression de compte client"
    >
      <Encadre genre="alerte" titre="Note importante">
        <p>
          La suppression de votre compte est définitive et ne peut pas être
          annulée. Nous vous recommandons de terminer ou transférer vos courses
          en cours avant la suppression.
        </p>
      </Encadre>

      <h2>Procédure de suppression</h2>
      <ol>
        {ETAPES.map((etape) => (
          <li key={etape}>{etape}</li>
        ))}
      </ol>

      <h2>Données supprimées</h2>
      <ul>
        <li>Votre profil utilisateur</li>
        <li>Vos performances enregistrées</li>
        <li>Votre emploi du temps</li>
        <li>Vos courses assignées</li>
        <li>Vos préférences de notification</li>
        <li>Tout l&apos;historique de vos activités</li>
      </ul>

      <h2>Données conservées</h2>
      <ul>
        <li>Données agrégées et anonymisées</li>
        <li>Données nécessaires aux obligations légales et comptables</li>
      </ul>

      <h2>Délais de conservation</h2>
      <p>
        La suppression de vos données personnelles sera effective sous 30
        {INSECABLE}jours. Les sauvegardes peuvent être conservées jusqu&apos;à
        90{INSECABLE}jours.
      </p>

      <h2>Protection des données</h2>
      <p>
        Vos données sont traitées conformément à notre{" "}
        <Ancre href="/fr/privacy-rules">politique de confidentialité</Ancre> et
        aux lois en vigueur.
      </p>

      <Encadre titre={`Besoin d'aide${INSECABLE}?`}>
        <ul>
          <li>
            <a
              className="inline-flex min-h-11 items-center"
              href="mailto:info@chicken-nation.com"
            >
              info@chicken-nation.com
            </a>
          </li>
          <li>
            Section «{INSECABLE}Aide{INSECABLE}» dans les Paramètres de
            l&apos;application
          </li>
        </ul>
      </Encadre>
    </TexteLong>
  );
}
