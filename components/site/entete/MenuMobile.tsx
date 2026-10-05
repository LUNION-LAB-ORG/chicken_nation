"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BoutonRond } from "../BoutonRond";
import { Icone } from "../Icone";
import { Conteneur } from "../Section";

import { LIENS_MENU_MOBILE, lienCourant } from "./liens";

import { TELEPHONE, telLien } from "@/lib/typo";

/**
 * Menu du téléphone, sous 960 px : volet sous l'en-tête. Échap le ferme et
 * rend le focus au bouton ; il se ferme aussi au choix d'un lien, à un clic
 * en dehors de l'en-tête, quand le focus quitte l'en-tête et à tout
 * changement de page.
 */
export function MenuMobile() {
  const chemin = usePathname();
  // Page sur laquelle le menu a été ouvert : changer de page le referme.
  const [ouvertSur, setOuvertSur] = useState<string | null>(null);
  const ouvert = ouvertSur !== null && ouvertSur === chemin;
  const bouton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const entete = bouton.current?.closest("header");
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOuvertSur(null);
      bouton.current?.focus();
    };
    const surPointeur = (e: PointerEvent) => {
      if (e.target instanceof Node && !entete?.contains(e.target))
        setOuvertSur(null);
    };

    // Le focus quitte l'en-tête (Tab après le dernier lien) : le menu se
    // ferme, sinon le focus passait sous le volet, sur des liens cachés
    // (critère WCAG 2.4.11).
    const surSortieFocus = (e: FocusEvent) => {
      const vers = e.relatedTarget;

      if (vers instanceof Node && !entete?.contains(vers)) setOuvertSur(null);
    };

    document.addEventListener("keydown", surTouche);
    document.addEventListener("pointerdown", surPointeur);
    entete?.addEventListener("focusout", surSortieFocus);

    return () => {
      document.removeEventListener("keydown", surTouche);
      document.removeEventListener("pointerdown", surPointeur);
      entete?.removeEventListener("focusout", surSortieFocus);
    };
  }, [ouvert]);

  return (
    <>
      <BoutonRond
        ref={bouton}
        aria-controls="menu-mobile"
        aria-expanded={ouvert}
        className="xl:hidden"
        icone={ouvert ? "croix" : "menu"}
        libelle="Menu"
        onClick={() => setOuvertSur(ouvert ? null : (chemin ?? ""))}
      />
      <div
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--h-entete))] overflow-y-auto overscroll-contain border-b border-trait bg-papier pt-1 pb-4 shadow-1 xl:hidden"
        hidden={!ouvert}
        id="menu-mobile"
      >
        <Conteneur>
          <ul className="list-none">
            {LIENS_MENU_MOBILE.map((lien) => (
              <li key={lien.href}>
                <Link
                  aria-current={lienCourant(lien.href, chemin)}
                  className="flex min-h-13 items-center justify-between border-b border-trait text-[17px] font-semibold text-encre no-underline"
                  href={lien.href}
                  // Ouvrir le menu ne télécharge pas les huit pages.
                  prefetch={false}
                  onClick={() => setOuvertSur(null)}
                >
                  {lien.libelle}
                  <Icone className="size-[18px] text-encre-doux" nom="droite" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3.5 text-sm text-encre-doux">
            Commandes par téléphone, 7 jours sur 7
            <a
              className="block w-fit text-[22px] font-bold whitespace-nowrap text-encre no-underline"
              href={telLien()}
            >
              {TELEPHONE}
            </a>
          </p>
        </Conteneur>
      </div>
    </>
  );
}
