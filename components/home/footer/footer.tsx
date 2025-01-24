import React from 'react';
import { Facebook, Github, Instagram,  } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="w-full">
      {/* Top Info Bar */}
      <div className="bg-primary text-white py-2 px-4 flex flex-wrap justify-between items-center text-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
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
        <div className="bg-primary text-white py-2 flex justify-center space-x-4">
              <a href="#">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#">
                <Instagram className="w-6 h-6" />
              </a>
              <div className="w-6 h-6 relative">
                <a href="#">
                  <Image
                    src="/assets/images/illustrations/page-accueil/Icon-whatsapp.png"
                    alt="WhatsApp Icon"
                    width={28}
                    height={28}
                    className="object-contain" 
                  />
                </a>
              </div>
          </div>

      </div>

      {/* Main Footer Content */}
      <div className="bg-primary-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="flex flex-col justify-start md:justify-center items-start md:items-center">
            <div className="w-32 h-32 relative">
              <Image
                src="/assets/images/logo_2.png"
                alt="Chicken Nation"
                layout="fill" // Permet d'adapter l'image à la taille de son conteneur
                objectFit="contain" // Équivalent à "object-contain" en CSS
              />
            </div>
          </div>

          {/* Explorer Section */}
          <div>
            <h3 className="text-xl font-title font-bold mb-4">EXPLORER</h3>
            <ul className="space-y-6">
              <li><a href="/accueil" className="hover:text-primary-300">Accueil</a></li>
              <li><a href="/restaurants" className="hover:text-primary-300">Notre restaurant</a></li>
              <li><a href="/histoire" className="hover:text-primary-300">Histoire</a></li>
              <li><a href="/franchise" className="hover:text-primary-300">Franchise</a></li>
              <li><a href="/contact" className="hover:text-primary-300">Contacts</a></li>
            </ul>
          </div>

          {/* Légales Section */}
          <div>
            <h3 className="text-xl font-title font-bold mb-4">LÉGALES</h3>
            <ul className="space-y-6">
              <li><a href="/politique" className="hover:text-primary-300">Politique et Confidentialité</a></li>
              <li><a href="/faq" className="hover:text-primary-300">FAQ</a></li>
            </ul>
          </div>

          {/* Nos Plats Section */}
          <div>
            <h3 className="text-xl font-title font-bold mb-4">NOS PLATS</h3>
            <ul className="space-y-6">
              <li><a href="/restaurants/marcory/burger" className="hover:text-primary-300">Poulets grillés</a></li>
              <li><a href="/restaurants/marcory/burger" className="hover:text-primary-300">Lunchs</a></li>
              <li><a href="/restaurants/marcory/burger" className="hover:text-primary-300">Combos</a></li>
              <li><a href="/restaurants/marcory/burger" className="hover:text-primary-300">Plats</a></li>
              <li><a href="/restaurants/marcory/burger" className="hover:text-primary-300">Plus</a></li>
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