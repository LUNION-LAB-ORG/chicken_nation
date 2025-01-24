import Image from 'next/image';

export default function Signup() {
  return (
    <div className="relative w-full h-screen bg-cover bg-center bg-no-repeat">
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
          <div className="flex items-center justify-center mb-6">
            <Image
                src="/assets/images/backgrounds/creation-compte.png"
              alt="Chicken Nation"
              width={100}
              height={100}
            />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-center">CRÉER UN COMPTE</h2>
          <p className="text-gray-600 mb-6 text-center">
            Accède à des fonctionnalités exclusives en créant un compte
          </p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Ton nom"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              placeholder="Ton prénom"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="email"
              placeholder="Ton mail"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="tel"
              placeholder="Ton numéro de téléphone"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="password"
              placeholder="Confirme ton mot de passe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-gray-600">
                Accède à des fonctionnalités exclusives en créant un compte
              </span>
            </div>
            <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500">
              Créer votre compte
            </button>
          </div>
          <div className="text-center mt-4 text-gray-600">
            Si tu es déjà inscris,{' '}
            <a href="#" className="text-orange-500 hover:underline">
              Conecter
            </a>
          </div>
          <div className="flex justify-between items-center mt-4 text-gray-600">
            <a href="#" className="hover:underline">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:underline">
              Termes et conditions
            </a>
          </div>
          <div className="text-center mt-4 text-gray-600">
            Copyright Chicken Nation. 2024 Tous droits réservés
          </div>
        </div>
      </div>
    </div>
  );
}