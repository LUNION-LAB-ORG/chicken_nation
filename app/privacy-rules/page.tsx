import Image from "next/image";

export default function PrivacyPolicyPage() {
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
          Politique de Confidentialité de l&apos;Application TURBOY
        </h1>

        <p className="text-sm text-gray-500 text-center">
          Dernière mise à jour : 24 Mars 2025
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Introduction</h2>
        <p>
          La présente politique de confidentialité décrit comment TURBO DELIVERY
          SARL collecte, utilise, partage et protège les informations
          personnelles des turboys qui utilisent l&apos;application mobile TURBOY.
        </p>
        <p>
          Nous nous engageons à protéger votre vie privée et à respecter les
          lois applicables en matière de protection des données.
        </p>

        <h2 className="text-xl font-semibold mt-6">2. Informations que nous collectons</h2>
        <p>Nous collectons les informations suivantes :</p>
        <ul className="list-disc pl-8 space-y-2">
          <li>Informations d&apos;identification : Nom, prénom, adresse, etc.</li>
          <li>Localisation GPS en temps réel.</li>
          <li>Informations sur l’engin motorisé.</li>
          <li>Informations de paiement.</li>
          <li>Historique des livraisons et données techniques.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">3. Utilisation des informations</h2>
        <ul className="list-disc pl-8 space-y-2">
          <li>Gestion des livraisons.</li>
          <li>Paiement des livreurs.</li>
          <li>Amélioration de l&apos;Application.</li>
          <li>Communication et notifications.</li>
          <li>Sécurité et conformité légale.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">4. Partage des informations</h2>
        <ul className="list-disc pl-8 space-y-2">
          <li>Partenaires de livraison.</li>
          <li>Prestataires de services.</li>
          <li>Autorités compétentes si nécessaire.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">5. Sécurité des informations</h2>
        <p>
          Nous mettons en œuvre des mesures de sécurité pour protéger vos
          informations contre tout accès non autorisé.
        </p>

        <h2 className="text-xl font-semibold mt-6">6. Vos droits</h2>
        <ul className="list-disc pl-8 space-y-2">
          <li>Droit d&apos;accès et de rectification.</li>
          <li>Droit de suppression et d&apos;opposition.</li>
          <li>Droit à la portabilité des données.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6">7. Modifications</h2>
        <p>
          Nous pouvons mettre à jour cette politique de confidentialité et vous
          informerons des modifications importantes.
        </p>

        <h2 className="text-xl font-semibold mt-6">8. Contact</h2>
        <p>
          Pour toute question, contactez-nous : info@turbodeliveryapp.com | 00225 07 78 68 74 08
        </p>
      </div>
    </div>
  );
}
