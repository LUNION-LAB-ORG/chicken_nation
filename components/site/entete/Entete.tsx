import Link from "next/link";

import Image from "../Image";
import { Conteneur } from "../Section";

import { BoutonCommander } from "./BoutonCommander";
import { BoutonPanier } from "./BoutonPanier";
import { CHEMIN_ACCUEIL } from "./liens";
import { MenuMobile } from "./MenuMobile";
import { NavPrincipale } from "./NavPrincipale";

import { TELEPHONE, telLien } from "@/lib/typo";

/**
 * En-tête collant de toutes les pages publiques (maquette, HTML 38-75,
 * CSS 181-259). Composant serveur ; seuls la navigation (page en cours),
 * « Commander », le panier et le menu du téléphone sont des îlots.
 *
 * Paliers : « Commander » masqué sous 360 px ; total du panier dès 720 px ;
 * navigation dès 960 px (resserrée et sans « Histoire » jusqu'à 1 099 px) ;
 * numéro dès 1 180 px. Tous mesurés jusqu'à 1 920 px sans débordement.
 */
export function Entete() {
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-trait bg-papier">
      <Conteneur className="flex h-(--h-entete) items-center gap-1.5 xl:gap-2.5">
        <Link
          aria-label="Chicken Nation, accueil"
          className="mr-auto flex shrink-0 items-center gap-2 rounded-lg text-encre no-underline xl:mr-[18px]"
          href={CHEMIN_ACCUEIL}
          // Pas de préchargement de l'accueil depuis chaque page : il
          // téléchargeait ses images principales et sa CSS pour rien
          // (données mobiles payantes). Voir Ancre.tsx.
          prefetch={false}
        >
          {/* Chargé tout de suite mais sans préchargement : seule l'image
              principale de la page est préchargée. */}
          <Image
            alt=""
            className="block size-[34px] md:size-[42px]"
            fetchPriority="low"
            height={42}
            loading="eager"
            src="/assets/site/logo-carre-orange.png"
            width={42}
          />
          <span className="font-affiche text-base leading-[0.95] uppercase [font-synthesis:none] md:text-[23px]">
            {/* Sur deux lignes, sauf entre 720 et 959 px où la place ne manque pas. */}
            <span className="block md:inline xl:block">Chicken</span>{" "}
            <span className="block md:inline xl:block">Nation</span>
          </span>
        </Link>
        <NavPrincipale />
        <a
          className="mr-1.5 hidden text-right text-[15px] leading-[1.15] font-bold whitespace-nowrap text-encre no-underline hover:underline 2xl:block"
          href={telLien()}
        >
          <small className="block text-[11px] font-medium text-encre-doux">
            Par téléphone
          </small>
          {TELEPHONE}
        </a>
        <BoutonCommander />
        <BoutonPanier />
        <MenuMobile />
      </Conteneur>
    </header>
  );
}
