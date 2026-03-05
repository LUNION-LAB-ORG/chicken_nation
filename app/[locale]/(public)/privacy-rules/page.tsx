import Image from "next/image";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 bg-white min-h-screen">
      <header className="flex items-center justify-between mb-8 px-4 py-2">
        <div className="relative w-14 h-14 lg:w-24 lg:h-24">
          <Image
            src="/assets/images/logo.png"
            alt="Logo Chicken Nation"
            fill
            className="object-contain"
          />
        </div>
      </header>

      <div className="space-y-6 px-8 pb-12">
        <h1 className="text-2xl font-bold text-center mb-8">
          Politique de Confidentialité de l&apos;Application CHICKEN NATION
        </h1>

        <p className="text-sm text-gray-500 text-center">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Introduction</h2>
        <p>
          Bienvenue sur l&apos;application mobile Chicken Nation, éditée et gérée par TURBO DELIVERY SARL. La protection de vos données personnelles est une priorité absolue pour nous.
        </p>
        <p>
          Cette politique de confidentialité vise à vous informer de manière transparente sur la façon dont nous collectons, utilisons, partageons et protégeons vos informations personnelles lorsque vous utilisez notre application pour passer une commande.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. Données collectées</h2>
        <p>Pour vous fournir nos services et traiter vos commandes, nous collectons les types d&apos;informations suivants :</p>
        <ul className="list-disc pl-8 space-y-2">
          <li><strong>Données d&apos;identification :</strong> Nom et prénom.</li>
          <li><strong>Profil (Optionnel) :</strong> Image de profil et Carte étudiant (Carte de la nation des étudiants).</li>
          <li><strong>Coordonnées :</strong> Numéro de téléphone et adresse e-mail.</li>
          <li><strong>Adresse de livraison :</strong> Adresse physique ou position géographique (si applicable).</li>
          <li><strong>Informations de paiement :</strong> Traitées de manière sécurisée par nos prestataires de services de paiement.</li>
          <li><strong>Données d&apos;utilisation :</strong> Historique des commandes et préférences alimentaires.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">3. Finalités de la collecte</h2>
        <p>Les données personnelles que nous collectons sont utilisées pour :</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>Le traitement, la préparation et la livraison de vos commandes.</li>
          <li>La communication avec vous concernant votre commande ou pour le service client.</li>
          <li>L&apos;amélioration de nos services et de votre expérience utilisateur.</li>
          <li>Le respect de nos obligations légales et réglementaires.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">4. Partage des données</h2>
        <p>
          Nous ne vendons, ne louons ni ne partageons vos données avec des tiers à des fins commerciales. Cependant, nous pouvons les partager avec :
        </p>
        <ul className="list-disc pl-8 space-y-2">
          <li><strong>Nos partenaires de livraison :</strong> Pour vous faire parvenir votre commande.</li>
          <li><strong>Nos prestataires de services de paiement :</strong> Pour sécuriser vos transactions.</li>
          <li><strong>Les autorités compétentes :</strong> Uniquement si requis par la loi.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">5. Sécurité des données</h2>
        <p>
          Nous mettons en place des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction.
        </p>

        <h2 className="text-xl font-semibold mt-6">6. Conservation et Suppression (Vos droits)</h2>
        <p>
          Nous conservons vos données tant que votre compte est actif. Vous disposez du droit de demander la suppression totale de votre compte et de vos données à tout moment depuis l&apos;application (Paramètres &gt; Supprimer mon compte) ou par e-mail.
        </p>
        <ul className="list-disc pl-8 space-y-2 mt-2">
          <li>Droit d&apos;accès et de rectification.</li>
          <li>Droit à l&apos;effacement (droit à l&apos;oubli).</li>
          <li>Droit à la portabilité des données.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">7. Contact</h2>
        <p>
          Pour toute question concernant cette politique ou pour exercer vos droits, contactez-nous :
        </p>
        <ul className="list-none space-y-1 mt-2">
          <li><strong>Email Client :</strong> info@chicken-nation.com</li>
          <li><strong>Email Technique :</strong> support@lunion-lab.com</li>
          <li><strong>Téléphone :</strong> +225 07 07 58 14 10 / +225 07 07 58 14 11</li>
          <li><strong>Site Web :</strong> www.chicken-nation.com</li>
        </ul>
      </div>
    </div>
  );
}