import React from 'react';
import { Facebook, Instagram,  } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="w-full">
      {/* Top Info Bar */}
      <div className="bg-secondary text-secondary-foreground py-2 px-4 flex flex-wrap justify-between items-center text-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <span className="flex items-center">
            📍 Chicken Nation Marcory Zone 4 / Chicken Nation Angré
          </span>
        </div>
        <span className="flex items-center">
          🕒 Tous les jours - 10h à 23h
        </span>
        <div className="bg-secondary text-secondary-foreground py-2 flex justify-center space-x-4">
  <a href="#">
    <Facebook className="w-6 h-6" />
  </a>
  <a href="#">
    <Instagram className="w-6 h-6" />
  </a>
  <a href="#" className="w-6 h-6">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor"
      className="w-6 h-6"
    >
      <path d="M16 0C7.164 0 0 7.164 0 16c0 2.826.735 5.544 2.129 7.938l-1.39 5.07 5.2-1.359C8.443 29.231 12.103 30 16 30c8.837 0 16-7.163 16-16S24.837 0 16 0zm6.59 21.653c-.693 1.943-4.075 3.345-5.837 3.345-3.657 0-7.178-2.885-8.579-5.334-1.375-2.416-1.385-4.385-1.009-4.981.393-.611.796-.709 1.074-.709.281 0 .562.003.812.014.252.012.594-.097.921.694.328.791 1.113 2.729 1.211 2.931.1.202.1.42-.019.621-.116.201-.175.323-.351.508-.175.185-.329.387-.469.582-.141.195-.279.321-.141.634.138.313.613 1.084 1.321 1.754.709.668 1.366.982 1.688 1.155.323.174.512.155.707-.046.193-.202.824-.914 1.043-1.23.221-.316.443-.247.757-.129.313.118 2.007.947 2.349 1.119.343.172.574.258.658.402.08.143.08.828-.612 1.772z" />
    </svg>
  </a>
</div>


      </div>

      {/* Main Footer Content */}
      <div className="bg-primary text-white py-8">
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