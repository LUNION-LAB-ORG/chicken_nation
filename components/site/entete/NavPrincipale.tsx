"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LIENS_NAVIGATION, lienCourant } from "./liens";

import { cn } from "@/lib/utils";

/**
 * Navigation de l'en-tête, dès 960 px. Îlot client pour marquer le lien de
 * la page en cours (aria-current) : la mise en page n'est pas refaite à
 * chaque navigation, elle ne connaît pas la page.
 */
export function NavPrincipale() {
  const chemin = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="mr-auto hidden gap-0.5 xl:flex"
    >
      {LIENS_NAVIGATION.map((lien) => (
        <Link
          key={lien.href}
          aria-current={lienCourant(lien.href, chemin)}
          className={cn(
            "inline-flex min-h-11 items-center rounded-pilule px-3 text-[15px] font-semibold whitespace-nowrap text-encre no-underline hover:bg-surface max-[1100px]:px-2.5 max-[1100px]:text-sm [&[aria-current]]:bg-jaune-pale",
            lien.des1100 && "max-[1100px]:hidden",
          )}
          href={lien.href}
        >
          {lien.libelle}
        </Link>
      ))}
    </nav>
  );
}
