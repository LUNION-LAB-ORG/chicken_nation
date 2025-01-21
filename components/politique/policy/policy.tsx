import React from 'react';

export default function Policy() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Conditions Générales</h1>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Dispositions Générales</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">1.1 Objet</h3>
              <p className="text-gray-700">Les présentes conditions générales définissent les modalités de vente et de service entre Saveur Express, ci-après dénommé "le restaurant", et ses clients.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">1.2 Application</h3>
              <p className="text-gray-700">Ces conditions s'appliquent à toutes les commandes et services proposés par le restaurant, que ce soit sur place, à emporter ou en livraison.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Commandes et Services</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">2.1 Prise de Commande</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Toute commande est considérée comme ferme et définitive après confirmation</li>
                <li>Le restaurant se réserve le droit de refuser toute commande anormale ou excessive</li>
                <li>Les prix affichés sont en euros TTC et peuvent être modifiés sans préavis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">2.2 Service de Livraison</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Zone de livraison limitée à 5 km autour du restaurant</li>
                <li>Commande minimum de 15€ pour la livraison</li>
                <li>Délais de livraison donnés à titre indicatif</li>
                <li>Frais de livraison variables selon la distance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">2.3 Disponibilité</h3>
              <p className="text-gray-700">Le restaurant se réserve le droit de modifier sa carte et ses menus sans préavis en fonction de la disponibilité des produits.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Prix et Paiement</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">3.1 Tarification</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Les prix sont affichés en euros TTC</li>
                <li>Les prix peuvent être modifiés sans préavis</li>
                <li>Les offres promotionnelles sont valables uniquement pendant leur durée de validité</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">3.2 Modalités de Paiement</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Paiement à la commande pour les livraisons</li>
                <li>Moyens de paiement acceptés : espèces, cartes bancaires, tickets restaurant</li>
                <li>Pas de chèques acceptés</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Programme de Fidélité</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">4.1 Adhésion</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Programme gratuit</li>
                <li>Une seule carte par personne</li>
                <li>Points non transférables</li>
                <li>Carte personnelle et non cessible</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">4.2 Utilisation</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Points valables 12 mois</li>
                <li>Non convertibles en espèces</li>
                <li>Non cumulables avec d'autres promotions sauf mention contraire</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">5. Qualité et Hygiène</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">5.1 Engagement Qualité</h3>
              <p className="text-gray-700">Le restaurant s'engage à :</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Respecter les normes d'hygiène en vigueur</li>
                <li>Utiliser des produits frais</li>
                <li>Former régulièrement son personnel</li>
                <li>Effectuer des contrôles qualité réguliers</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">5.2 Allergènes</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Liste des allergènes disponible sur demande</li>
                <li>Le client est responsable de signaler ses allergies</li>
                <li>Le restaurant décline toute responsabilité en cas de non-signalement</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Responsabilité et Réclamations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">6.1 Responsabilité du Restaurant</h3>
              <p className="text-gray-700">Le restaurant est responsable :</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>De la qualité des produits servis</li>
                <li>Du respect des normes d'hygiène</li>
                <li>De la formation de son personnel</li>
                <li>Du respect des délais annoncés</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">6.2 Procédure de Réclamation</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Toute réclamation doit être faite dans les 24h</li>
                <li>Conservation du ticket de caisse obligatoire</li>
                <li>Traitement sous 48h ouvrés maximum</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">7. Protection des Données</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">7.1 Collecte des Données</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Conformité RGPD</li>
                <li>Données collectées uniquement pour le service</li>
                <li>Non transmission à des tiers</li>
                <li>Conservation limitée dans le temps</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">7.2 Droits des Clients</h3>
              <p className="text-gray-700">Le client dispose d'un droit :</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>D'accès à ses données</li>
                <li>De rectification</li>
                <li>D'effacement</li>
                <li>D'opposition au traitement</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">8. Propriété Intellectuelle</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">8.1 Droits</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Logo et marque déposés</li>
                <li>Photos et contenus protégés</li>
                <li>Reproduction interdite sans autorisation</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">9. Modification des Conditions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">9.1 Évolution</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Le restaurant se réserve le droit de modifier ces conditions</li>
                <li>Les modifications prennent effet immédiatement</li>
                <li>Information des clients par affichage en restaurant</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">10. Droit Applicable</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">10.1 Juridiction</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Droit français applicable</li>
                <li>Tribunal de commerce compétent en cas de litige</li>
                <li>Médiation possible avant procédure judiciaire</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">11. Contact</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">11.1 Service Client</h3>
              <p className="text-gray-700">Pour toute question relative à ces conditions :</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Email : [email]</li>
                <li>Téléphone : [numéro]</li>
                <li>Adresse : [adresse]</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 text-sm text-gray-500">
        Dernière mise à jour : [date]
      </div>
    </div>
  );
}