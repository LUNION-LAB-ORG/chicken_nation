import type { IPhotoPlat } from "./types/carte.types";

import photosRecadrees from "./data/photos-plats.json";

import { formatImageUrl } from "@/utils/formatImageUrl";

/**
 * Photo d'un plat (retouche 5) : toujours entière (`object-fit: contain`),
 * posée sur la couleur de son fond.
 *
 * - Photo recadrée de la maquette (`public/assets/plats/<id>.webp`, écrite par
 *   `scripts/photos-plats.mjs`) pour les 48 plats de l'instantané du 02/10 ;
 *   l'étiquette étoile, retirée du recadrage, est redessinée en CSS.
 * - Sinon (FRITE RT ORANGINA, nouveaux plats, base de test) : photo de l'API,
 *   carrée, qui porte déjà son étiquette, sur le fond crème.
 */

type Recadrage = {
  fond: string;
  l: number;
  h: number;
  ratio: number;
  etiquette: boolean;
};
const RECADRAGES = photosRecadrees as Record<string, Recadrage>;

/** Fond des photos de plats (et de la zone qui les porte). */
export const FOND_PHOTO_PLAT = "#FBEACA";

// Les photos de l'API font 1080 × 1080.
const COTE_PHOTO_API = 1080;

// Plat sans aucune photo : le logo au centre de la zone crème. Fichier de
// 203 × 300 px : l'ancien logo de 49 × 69 px était agrandi jusqu'à 2,7 fois,
// donc flou (recette rendu 12).
export const IMAGE_DEFAUT_PLAT = "/assets/site/logo-orange.png";
const IMAGE_DEFAUT = {
  src: IMAGE_DEFAUT_PLAT,
  largeur: 203,
  hauteur: 300,
};

export const aPhotoRecadree = (id: string) =>
  Object.prototype.hasOwnProperty.call(RECADRAGES, id);

export function photoPlat(
  id: string,
  imageApi: string | null | undefined,
): IPhotoPlat {
  if (aPhotoRecadree(id)) {
    const r = RECADRAGES[id];

    return {
      src: `/assets/plats/${id}.webp`,
      fond: r.fond,
      largeur: r.l,
      hauteur: r.h,
      ratio: r.ratio,
      etiquette: r.etiquette,
      recadree: true,
    };
  }
  if (imageApi) {
    return {
      src: formatImageUrl(imageApi, IMAGE_DEFAUT.src),
      fond: FOND_PHOTO_PLAT,
      largeur: COTE_PHOTO_API,
      hauteur: COTE_PHOTO_API,
      ratio: 1,
      etiquette: false,
      recadree: false,
    };
  }

  return {
    src: IMAGE_DEFAUT.src,
    fond: FOND_PHOTO_PLAT,
    largeur: IMAGE_DEFAUT.largeur,
    hauteur: IMAGE_DEFAUT.hauteur,
    ratio:
      Math.round((IMAGE_DEFAUT.largeur / IMAGE_DEFAUT.hauteur) * 1000) / 1000,
    etiquette: false,
    recadree: false,
  };
}
