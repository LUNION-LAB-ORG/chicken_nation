"use client";

import React from "react";
import { AlertCircle, Mail, Clock, Shield, HelpCircle } from "lucide-react";

export default function Content() {

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Suppression de compte <span className="text-color-one">LIVREUR</span>
          </h1>

          <div className="prose max-w-none">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-red-900 mb-2">
                    Note importante
                  </h2>
                  <p className="text-red-700 mb-0">
                    La suppression de votre compte est définitive et ne peut pas
                    être annulée. Nous vous recommandons de terminer ou
                    transférer vos courses en cours avant la suppression.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Procédure de suppression
            </h2>
            <ol className="space-y-4 mb-8">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#EF3E2D] text-white flex items-center justify-center font-semibold">
                  1
                </span>
                <span>
                  Ouvrez le menu principal (icône ≡ en haut à gauche de l&apos;écran
                  d&apos;accueil)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#EF3E2D] text-white flex items-center justify-center font-semibold">
                  2
                </span>
                <span>Sélectionnez &quot;Paramètres&quot; en bas du menu</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#EF3E2D] text-white flex items-center justify-center font-semibold">
                  3
                </span>
                <span>
                  Dans l&apos;écran Paramètres, faites défiler jusqu&apos;en bas
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#EF3E2D] text-white flex items-center justify-center font-semibold">
                  4
                </span>
                <span>Appuyez sur &quot;Supprimer mon compte&quot;</span>
              </li>
            </ol>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Données supprimées
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Votre profil utilisateur</li>
                  <li>• Vos performances enregistrées</li>
                  <li>• Votre emploi du temps</li>
                  <li>• Vos courses assignées</li>
                  <li>• Vos préférences de notification</li>
                  <li>• Tout l&apos;historique de vos activités</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Données conservées
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Données agrégées et anonymisées</li>
                  <li>
                    • Données nécessaires aux obligations légales et comptables
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex gap-3 items-start">
                <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Délais de conservation
                  </h3>
                  <p className="text-gray-600 mt-1">
                    La suppression de vos données personnelles sera effective
                    sous 30 jours. Les sauvegardes peuvent être conservées
                    jusqu&apos;à 90 jours.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Protection des données
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Vos données sont traitées conformément à notre politique de
                    confidentialité et aux lois en vigueur.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Besoin d&apos;aide ?
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <a
                    href="mailto:info@chicken-nation.com"
                    className="text-[#EF3E2D] hover:text-red-700"
                  >
                    info@chicken-nation.com
                  </a>
                </div>
                <div className="flex gap-3 items-center">
                  <HelpCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600">
                    Section &quot;Aide&quot; dans les Paramètres de l&apos;application
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  );
}
