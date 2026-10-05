import Image from "next/image";

import { Ancre } from "./Ancre";

import { liensStores } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Badges officiels des stores (retouche 9), même largeur, ouverts dans un
 * nouvel onglet. `pile` les empile (à côté du QR code).
 */
export function BadgesStores({
  pile,
  petits,
  className,
}: {
  pile?: boolean;
  /** 140 px au lieu de 160 (page de suivi, avantages sur téléphone). */
  petits?: boolean;
  className?: string;
}) {
  const largeur = petits ? "w-[140px]" : "w-[148px] md:w-40";

  return (
    <ul
      className={cn(
        "flex list-none flex-wrap items-center gap-2.5",
        pile && "md:flex-col md:items-start",
        className,
      )}
    >
      <li>
        <Ancre
          nouvelOnglet
          className={cn("block rounded-lg", largeur)}
          href={liensStores.android}
        >
          <Image
            alt="Disponible sur Google Play"
            className="block h-auto w-full"
            height={250}
            sizes={petits ? "140px" : "160px"}
            src="/download-playstore-fr-FR.png"
            width={646}
          />
        </Ancre>
      </li>
      <li>
        <Ancre
          nouvelOnglet
          className={cn("block rounded-lg", largeur)}
          href={liensStores.ios}
        >
          {/* SVG : déjà léger et net à toute taille, pas d'optimisation. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Télécharger dans l'App Store"
            className="block h-auto w-full"
            decoding="async"
            height={40}
            loading="lazy"
            src="/download-apple-fr-FR.svg"
            width={127}
          />
        </Ancre>
      </li>
    </ul>
  );
}
