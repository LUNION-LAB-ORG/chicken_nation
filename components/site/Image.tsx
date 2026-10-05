/* eslint-disable @next/next/no-img-element -- <img> écrit à partir des attributs de next/image. */
import type { ImageProps } from "next/image";
import type { ImageConfigComplete } from "next/dist/shared/lib/image-config";

import { getImgProps } from "next/dist/shared/lib/get-img-props";
import chargeurNext from "next/dist/shared/lib/image-loader";
import { preload as precharger } from "react-dom";

/**
 * Image optimisée par Next (/_next/image, AVIF puis WebP, srcset et sizes),
 * rendue en simple <img> par le serveur.
 *
 * Même usage et mêmes attributs que `next/image` (c'est le calcul de son
 * `getImageProps`), sans son composant client : celui-ci ne sert qu'aux
 * images floutées d'attente et aux rappels de chargement, que le site
 * n'utilise pas, et pesait environ 6 ko de JavaScript sur chaque page.
 * `getImageProps` n'est pas importé de "next/image" : ce module déclare le
 * composant client, que Next enverrait alors au navigateur quand même.
 *
 * `preload` demande l'image dans l'en-tête du document, comme next/image.
 */
export default function Image(props: ImageProps) {
  const { props: attributs } = getImgProps(props, {
    defaultLoader: chargeurNext,
    // Réglages `images` de next.config.mjs, écrits par Next à la construction.
    imgConf: process.env.__NEXT_IMAGE_OPTS as unknown as ImageConfigComplete,
  });

  if (props.preload) {
    precharger(attributs.src, {
      as: "image",
      imageSrcSet: attributs.srcSet,
      imageSizes: attributs.sizes,
      crossOrigin: attributs.crossOrigin,
      referrerPolicy: attributs.referrerPolicy,
      fetchPriority: attributs.fetchPriority,
    });
  }

  return (
    <img
      {...attributs}
      alt={attributs.alt}
      data-nimg={props.fill ? "fill" : "1"}
    />
  );
}
