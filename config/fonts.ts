import { Poppins } from "next/font/google";
import localFont from "next/font/local";

import { cn } from "@/lib/utils";

/**
 * Police du texte. Le sous-ensemble latin couvre é, à, ç, œ.
 * Le 500 est gardé : la maquette s'en sert 19 fois, dont les phrases
 * d'introduction sur les aplats orange et sombres, où le 400 est trop maigre
 * et le 600 trop gras. Cinq fichiers d'environ 8 ko.
 */
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--police-poppins",
});

/**
 * Police d'affiche, pour les seuls grands titres écrits dans le code
 * (composant TitreAffiche). Elle n'a que A-Z, a-z, 0-9, l'espace, la virgule
 * et le point : ni É ni À.
 *
 * Fichier réduit de 206 ko (TTF) à 22 ko (WOFF2) avec fonttools, dans un
 * environnement Python jetable : sous-ensemble des 65 caractères, sans
 * hinting, grille ramenée de 1000 à 256 unités, et retrait des 4 900 plus
 * petites taches de la texture sur 6 400 (moins de 75 unités², moins de
 * 1,5 px² même à 136 px). Rendu comparé à l'original à 34, 48, 90 et 136 px.
 * Le TTF d'origine (styles/polices/Balbeer-Rustic.ttf) reste pour les images
 * de partage générées (next/og ne lit pas le WOFF2).
 */
export const balbeer = localFont({
  src: "../styles/polices/balbeer-rustic.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--police-balbeer",
});

/**
 * Variables des deux polices, posées sur <html> : les jetons --font-texte et
 * --font-affiche de styles/globals.css s'y réfèrent.
 */
export const classesPolices = cn(poppins.variable, balbeer.variable);
