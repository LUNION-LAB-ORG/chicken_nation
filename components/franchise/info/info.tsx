import React from 'react';

export default function Info() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold text-center font-title text-primary">
        REJOIGNEZ L'AVENTURE CHICKEN NATION
      </h1>

      <div className="bg-gray-100 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-2">Devenez Franchisé</h2>
        <h3 className="text-xl text-primary mb-4">Une Success Story en Pleine Croissance</h3>
        <p className="text-gray-700 leading-relaxed">
          Depuis notre création, Saveur Express s'est imposé comme une référence dans la restauration rapide
          de qualité. Notre concept unique et notre engagement envers l'excellence ont séduit des milliers de
          clients. Aujourd'hui, nous cherchons des entrepreneurs passionnés pour développer notre réseau de
          franchises.
        </p>
      </div>

      <div className="bg-gray-100 p-8 rounded-lg">
        <h2 className="text-3xl font-bold mb-6">Pourquoi Nous Rejoindre ?</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl text-white bg-primary p-3 rounded-full mb-4">
                Un Concept Éprouvé
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Modèle économique rentable</li>
                <li>Marque reconnue et appréciée</li>
                <li>Processus opérationnels optimisés</li>
                <li>Formation complète assurée</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl text-white bg-primary p-3 rounded-full mb-4">
                Avantages concurrentiels
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Recettes exclusives</li>
                <li>Produits de qualité supérieure</li>
                <li>Fournisseurs référencés</li>
                <li>Outils digitaux innovants</li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xl text-white bg-primary p-3 rounded-full mb-4">
              Un Accompagnement Total
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Formation initiale de 6 semaines</li>
              <li>Support continu à l'ouverture</li>
              <li>Assistance marketing personnalisée</li>
              <li>Suivi opérationnel régulier</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}