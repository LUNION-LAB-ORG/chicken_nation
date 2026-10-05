import { setRequestLocale } from "next-intl/server";

import { pageMetadata } from "../../meta";

import { TexteLong } from "@/components/site/TexteLong";
import { INSECABLE } from "@/lib/typo";

// Non indexée, hors du sitemap et du pied de page : le texte est un modèle
// jamais rempli (« Saveur Express », prix en euros, livraison à 5 km,
// « [email] », « [date] »), faux et contraire à la FAQ. À réindexer
// (indexable, sitemap, lien « Conditions générales ») quand le client aura
// fourni le vrai texte.
export const metadata = pageMetadata({
  chemin: "/politique",
  titre: "Termes et conditions",
  description: `Conditions générales d'utilisation des services CHICKEN NATION${INSECABLE}: commandes, livraison, paiement et données personnelles.`,
  indexable: false,
});

// Contenu juridique repris tel quel de l'ancienne page (seules la typographie
// et la hiérarchie des titres changent : un seul h1, celui de l'en-tête).
export default async function Politique({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <TexteLong
      fondEntete="jaune"
      miseAJour={`Dernière mise à jour${INSECABLE}: [date]`}
      surtitre="Conditions générales"
      titre="Termes et conditions"
    >
      <h2>1. Dispositions générales</h2>
      <h3>1.1 Objet</h3>
      <p>
        Les présentes conditions générales définissent les modalités de vente et
        de service entre Saveur Express, ci-après dénommé «{INSECABLE}le
        restaurant{INSECABLE}», et ses clients.
      </p>
      <h3>1.2 Application</h3>
      <p>
        Ces conditions s&apos;appliquent à toutes les commandes et services
        proposés par le restaurant, que ce soit sur place, à emporter ou en
        livraison.
      </p>

      <h2>2. Commandes et services</h2>
      <h3>2.1 Prise de commande</h3>
      <ul>
        <li>
          Toute commande est considérée comme ferme et définitive après
          confirmation
        </li>
        <li>
          Le restaurant se réserve le droit de refuser toute commande anormale
          ou excessive
        </li>
        <li>
          Les prix affichés sont en euros TTC et peuvent être modifiés sans
          préavis
        </li>
      </ul>
      <h3>2.2 Service de livraison</h3>
      <ul>
        <li>Zone de livraison limitée à 5{INSECABLE}km autour du restaurant</li>
        <li>Commande minimum de 15{INSECABLE}€ pour la livraison</li>
        <li>Délais de livraison donnés à titre indicatif</li>
        <li>Frais de livraison variables selon la distance</li>
      </ul>
      <h3>2.3 Disponibilité</h3>
      <p>
        Le restaurant se réserve le droit de modifier sa carte et ses menus sans
        préavis en fonction de la disponibilité des produits.
      </p>

      <h2>3. Prix et paiement</h2>
      <h3>3.1 Tarification</h3>
      <ul>
        <li>Les prix sont affichés en euros TTC</li>
        <li>Les prix peuvent être modifiés sans préavis</li>
        <li>
          Les offres promotionnelles sont valables uniquement pendant leur durée
          de validité
        </li>
      </ul>
      <h3>3.2 Modalités de paiement</h3>
      <ul>
        <li>Paiement à la commande pour les livraisons</li>
        <li>
          Moyens de paiement acceptés{INSECABLE}: espèces, cartes bancaires,
          tickets restaurant
        </li>
        <li>Pas de chèques acceptés</li>
      </ul>

      <h2>4. Programme de fidélité</h2>
      <h3>4.1 Adhésion</h3>
      <ul>
        <li>Programme gratuit</li>
        <li>Une seule carte par personne</li>
        <li>Points non transférables</li>
        <li>Carte personnelle et non cessible</li>
      </ul>
      <h3>4.2 Utilisation</h3>
      <ul>
        <li>Points valables 12{INSECABLE}mois</li>
        <li>Non convertibles en espèces</li>
        <li>
          Non cumulables avec d&apos;autres promotions sauf mention contraire
        </li>
      </ul>

      <h2>5. Qualité et hygiène</h2>
      <h3>5.1 Engagement qualité</h3>
      <p>Le restaurant s&apos;engage à{INSECABLE}:</p>
      <ul>
        <li>Respecter les normes d&apos;hygiène en vigueur</li>
        <li>Utiliser des produits frais</li>
        <li>Former régulièrement son personnel</li>
        <li>Effectuer des contrôles qualité réguliers</li>
      </ul>
      <h3>5.2 Allergènes</h3>
      <ul>
        <li>Liste des allergènes disponible sur demande</li>
        <li>Le client est responsable de signaler ses allergies</li>
        <li>
          Le restaurant décline toute responsabilité en cas de non-signalement
        </li>
      </ul>

      <h2>6. Responsabilité et réclamations</h2>
      <h3>6.1 Responsabilité du restaurant</h3>
      <p>Le restaurant est responsable{INSECABLE}:</p>
      <ul>
        <li>De la qualité des produits servis</li>
        <li>Du respect des normes d&apos;hygiène</li>
        <li>De la formation de son personnel</li>
        <li>Du respect des délais annoncés</li>
      </ul>
      <h3>6.2 Procédure de réclamation</h3>
      <ul>
        <li>Toute réclamation doit être faite dans les 24{INSECABLE}h</li>
        <li>Conservation du ticket de caisse obligatoire</li>
        <li>Traitement sous 48{INSECABLE}h ouvrés maximum</li>
      </ul>

      <h2>7. Protection des données</h2>
      <h3>7.1 Collecte des données</h3>
      <ul>
        <li>Conformité RGPD</li>
        <li>Données collectées uniquement pour le service</li>
        <li>Non transmission à des tiers</li>
        <li>Conservation limitée dans le temps</li>
      </ul>
      <h3>7.2 Droits des clients</h3>
      <p>Le client dispose d&apos;un droit{INSECABLE}:</p>
      <ul>
        <li>D&apos;accès à ses données</li>
        <li>De rectification</li>
        <li>D&apos;effacement</li>
        <li>D&apos;opposition au traitement</li>
      </ul>

      <h2>8. Propriété intellectuelle</h2>
      <h3>8.1 Droits</h3>
      <ul>
        <li>Logo et marque déposés</li>
        <li>Photos et contenus protégés</li>
        <li>Reproduction interdite sans autorisation</li>
      </ul>

      <h2>9. Modification des conditions</h2>
      <h3>9.1 Évolution</h3>
      <ul>
        <li>Le restaurant se réserve le droit de modifier ces conditions</li>
        <li>Les modifications prennent effet immédiatement</li>
        <li>Information des clients par affichage en restaurant</li>
      </ul>

      <h2>10. Droit applicable</h2>
      <h3>10.1 Juridiction</h3>
      <ul>
        <li>Droit français applicable</li>
        <li>Tribunal de commerce compétent en cas de litige</li>
        <li>Médiation possible avant procédure judiciaire</li>
      </ul>

      <h2>11. Contact</h2>
      <h3>11.1 Service client</h3>
      <p>Pour toute question relative à ces conditions{INSECABLE}:</p>
      <ul>
        <li>Email{INSECABLE}: [email]</li>
        <li>Téléphone{INSECABLE}: [numéro]</li>
        <li>Adresse{INSECABLE}: [adresse]</li>
      </ul>
    </TexteLong>
  );
}
