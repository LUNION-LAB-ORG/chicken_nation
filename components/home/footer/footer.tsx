import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram } from 'lucide-react';
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
          <Link target="_blank" href="https://www.facebook.com/chickennationabj/"><Facebook className="w-6 h-6" /></Link>
          <Link target="_blank" href="https://www.instagram.com/chickennationabj/"><Instagram className="w-6 h-6" /></Link>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="flex flex-col justify-start md:justify-center items-start md:items-center">
            <div className="w-32 h-32 relative">
              <Image src="/assets/images/logo_2.png" alt="Chicken Nation" layout="fill" objectFit="contain" />
            </div>
          </div>

          {/* Explorer Section */}
          <div>
            <h3 className="text-xl font-title font-bold mb-4">EXPLORER</h3>
            <ul className="space-y-6">
              <li><Link href="/" className="hover:text-primary-300">Accueil</Link></li>
              <li><Link href="/restaurants" className="hover:text-primary-300">Notre restaurant</Link></li>
              <li><Link href="/histoire" className="hover:text-primary-300">Histoire</Link></li>
              <li><Link href="/franchise" className="hover:text-primary-300">Franchise</Link></li>
              <li><Link href="/contact" className="hover:text-primary-300">Contacts</Link></li>
            </ul>
          </div>

          {/* Légales Section */}
          <div>
            <h3 className="text-xl font-title font-bold mb-4">LEGALE</h3>
            <ul className="space-y-6">
              {/* <li><Link href="/politique" className="hover:text-primary-300">Politique et Confidentialité</Link></li> */}
              <li><Link href="/faq" className="hover:text-primary-300">FAQ</Link></li>
            </ul>
          </div>

          {/* Nos Plats Section */}
          <div>
            <h3 className="text-xl font-title font-bold mb-4">NOS PLATS</h3>
            <ul className="space-y-6">
              <li><Link href="/restaurants/marcory/burger" className="hover:text-primary-300">Poulets grillés</Link></li>
              <li><Link href="/restaurants/marcory/burger" className="hover:text-primary-300">Lunchs</Link></li>
              <li><Link href="/restaurants/marcory/burger" className="hover:text-primary-300">Combos</Link></li>
              <li><Link href="/restaurants/marcory/burger" className="hover:text-primary-300">Plats</Link></li>
              <li><Link href="/restaurants/marcory/burger" className="hover:text-primary-300">Plus</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-white py-2 px-4 text-center text-primary text-sm">
        <p>
          Copyright Chicken Nation, 2024 Tous droits réservés |{" "}
          <span>
            designed and developed by{" "}
            <a href="https://lunion-lab.com" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold underline hover:text-primary-700">
              Lunion-Lab
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
