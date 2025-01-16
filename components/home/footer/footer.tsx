import React from 'react';
import { Facebook, Github, Instagram,  } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full">
      {/* Top Info Bar */}
      <div className="bg-orange-500 text-white py-2 px-4 flex flex-wrap justify-between items-center text-sm">
        <div className="flex items-center gap-8">
          <span className="flex items-center">
            <Github className="w-4 h-4 mr-1" />
            +225 0747000034
          </span>
          <span className="flex items-center">
            📍 Chicken Nation Marcory Zone 4 / Chicken Nation Angré
          </span>
        </div>
        <span className="flex items-center">
          🕒 Tous les jours - 10h à 23h
        </span>
            <div className="bg-orange-500 text-white py-2 flex justify-center space-x-4">
            <a href="#" className="hover:text-orange-200">
            <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-orange-200">
            <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="hover:text-orange-200">
            <Github className="w-6 h-6" />
            </a>
            </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-amber-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-32 h-32">
              <img
                src="assets/images/logo_2.png"
                alt="Chicken Nation"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Explorer Section */}
          <div>
            <h3 className="text-xl font-title font-bold mb-4">EXPLORER</h3>
            <ul className="space-y-2">
              <li><a href="/accueil" className="hover:text-orange-300">Accueil</a></li>
              <li><a href="/notre-restaurant" className="hover:text-orange-300">Notre restaurant</a></li>
              <li><a href="/notre-carte" className="hover:text-orange-300">Notre carte</a></li>
              <li><a href="/franchise" className="hover:text-orange-300">Franchise</a></li>
              <li><a href="/conditions" className="hover:text-orange-300">Conditions d'utilisation</a></li>
            </ul>
          </div>

          {/* Légales Section */}
          <div>
            <h3 className="text-xl font-title font-bold mb-4">LÉGALES</h3>
            <ul className="space-y-2">
              <li><a href="/politique" className="hover:text-orange-300">Politique et Confidentialité</a></li>
              <li><a href="/termes" className="hover:text-orange-300">Termes et Conditions</a></li>
            </ul>
          </div>

          {/* Nos Plats Section */}
          <div>
            <h3 className="text-xl font-title font-bold mb-4">NOS PLATS</h3>
            <ul className="space-y-2">
              <li><a href="/poulets" className="hover:text-orange-300">Poulets grillés</a></li>
              <li><a href="/lunchs" className="hover:text-orange-300">Lunchs</a></li>
              <li><a href="/combos" className="hover:text-orange-300">Combos</a></li>
              <li><a href="/plats" className="hover:text-orange-300">Plats</a></li>
              <li><a href="/plus" className="hover:text-orange-300">Plus</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-white py-2 px-4 text-center text-primary text-sm">
        <p>Copyright Chicken Nation, 2024 Tous droits réservés</p>
      </div>
    </footer>
  );
};

export default Footer;