"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";
import Title from "@/components/primitives/Title";

const Footer = () => {
  return (
    <footer className="w-full text-sm">
      <div className="bg-secondary border-secondary text-secondary-foreground py-3 px-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <span className="flex items-center text-center md:text-left">
          📍 Chicken Nation Marcory Zone 4 / Angré / Sococe
        </span>

        <span className="flex items-center">🕒 Tous les jours — 10h à 23h</span>

        <div className="flex justify-center items-center space-x-4">
          <a
            href="https://www.facebook.com/chickennationabj"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a
            href="https://www.instagram.com/chickennationabj/?hl=fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="flex flex-col items-center md:items-start">
            <div className="relative w-28 h-28 mb-4">
              <Image
                src="/assets/images/logo_2.png"
                alt="Chicken Nation"
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-center md:text-left opacity-80 leading-relaxed">
              Chicken Nation — le goût du vrai poulet croustillant
            </p>
          </div>

          {/* Explorer */}
          <div className="flex flex-col gap-2">
            <Title size="xs" color="white" className="mb-4 text-left">
              EXPLORER
            </Title>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary-300 transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurants"
                  className="hover:text-primary-300 transition-colors"
                >
                  Notre restaurant
                </Link>
              </li>
              <li>
                <Link
                  href="/histoire"
                  className="hover:text-primary-300 transition-colors"
                >
                  Histoire
                </Link>
              </li>
              <li>
                <Link
                  href="/franchise"
                  className="hover:text-primary-300 transition-colors"
                >
                  Franchise
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary-300 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div className="flex flex-col gap-2">
            <Title size="xs" color="white" className="mb-4 text-left">
              LÉGAL
            </Title>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary-300 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/politique"
                  className="hover:text-primary-300 transition-colors"
                >
                  Politique & Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Nos plats */}
          <div className="flex flex-col gap-2">
            <Title size="xs" color="white" className="mb-4 text-left">
              NOS PLATS
            </Title>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/restaurants/marcory/poulets"
                  className="hover:text-primary-300 transition-colors"
                >
                  Poulets grillés
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurants/marcory/lunchs"
                  className="hover:text-primary-300 transition-colors"
                >
                  Lunchs
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurants/marcory/combos"
                  className="hover:text-primary-300 transition-colors"
                >
                  Combos
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurants/marcory/plats"
                  className="hover:text-primary-300 transition-colors"
                >
                  Plats
                </Link>
              </li>
              <li>
                <Link
                  href="/restaurants/marcory/plus"
                  className="hover:text-primary-300 transition-colors"
                >
                  Plus
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* === Bottom Bar === */}
      <div className="bg-white py-3 px-4 text-center text-primary text-xs sm:text-sm">
        <p>
          © 2024 <span className="font-semibold">Chicken Nation</span> — Tous
          droits réservés |{" "}
          <a
            href="https://lunion-lab.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold underline hover:text-primary-700 transition-colors"
          >
            Lunion-Lab
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
