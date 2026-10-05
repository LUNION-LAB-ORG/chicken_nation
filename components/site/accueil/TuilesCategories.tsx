import type { ICategorieCarte } from "@/features/menus/types/carte.types";

import { Ancre } from "../Ancre";
import { PhotoPlat } from "../PhotoPlat";
import { Section } from "../Section";

import { TeteBloc } from "./TeteBloc";

import {
  fourchettePrix,
  platsDeLaCarte,
  platVitrine,
} from "@/features/menus/carte";
import { CLE_PROMOTIONS } from "@/features/menus/carte.categories";
import { fcfa, pluriel } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** « 48 plats, à partir de 2 000 FCFA. » (chaque plat compté une fois). */
export function phraseCarte(carte: readonly ICategorieCarte[]) {
  const plats = platsDeLaCarte(carte);
  const prix = fourchettePrix(carte);

  return `${pluriel(plats.length, "plat", "plats")}${prix ? `, à partir de ${fcfa(prix.min)}` : ""}. Tailles, sauces et suppléments au choix.`;
}

/**
 * « La carte » (maquette, HTML 137-148, JS 81-94) : une tuile par catégorie
 * de la carte, illustrée par son plat vitrine, vers sa section de /fr/carte.
 * Catégories regroupées par la table du site (jamais `GET /categories`) ;
 * section masquée si la carte est vide.
 */
export function TuilesCategories({
  carte,
}: {
  carte: readonly ICategorieCarte[];
}) {
  if (carte.length === 0) return null;

  return (
    <Section id="la-carte" titreId="la-carte-titre">
      <TeteBloc
        lien={{ href: "/fr/carte", texte: "Voir toute la carte" }}
        sousTitre={phraseCarte(carte)}
        titre="La carte"
        titreId="la-carte-titre"
      />
      {/* Une colonne sous 360 px : à deux, les noms seraient coupés. */}
      <ul className="grid list-none grid-cols-1 gap-2.5 xs:grid-cols-2 lg:grid-cols-4 lg:gap-3.5">
        {carte.map((categorie) => {
          const vitrine = platVitrine(categorie);
          const promo = categorie.cle === CLE_PROMOTIONS;

          return (
            <li key={categorie.cle} className="min-w-0">
              <Ancre
                className={cn(
                  "grid h-full min-h-[68px] grid-cols-[44px_minmax(0,1fr)] items-center gap-2 rounded-carte border py-[7px] pr-2.5 pl-[7px] text-encre no-underline transition-[border-color,box-shadow] duration-150 hover:shadow-1 sm:grid-cols-[52px_minmax(0,1fr)] sm:gap-2.5 lg:min-h-[88px] lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-3.5",
                  promo
                    ? "border-jaune bg-jaune-pale hover:border-orange"
                    : "border-trait bg-white hover:border-trait-fort",
                )}
                href={`/fr/carte#${categorie.cle}`}
              >
                {vitrine ? (
                  // Décor : le nom de la catégorie est juste à côté.
                  <PhotoPlat
                    alt=""
                    className="size-[44px] sm:size-[52px] lg:size-[72px]"
                    fond={vitrine.photo.fond}
                    marge={4}
                    sizes="(min-width: 900px) 64px, 44px"
                    src={vitrine.photo.src}
                  />
                ) : (
                  <span aria-hidden="true" />
                )}
                <span className="min-w-0">
                  <span className="block text-sm leading-tight font-bold break-words lg:text-base">
                    {categorie.nom}
                  </span>
                  <span className="mt-0.5 block text-xs text-encre-doux">
                    {pluriel(categorie.plats.length, "plat", "plats")}
                  </span>
                </span>
              </Ancre>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
