import type { IPlatCarte } from "@/features/menus/types/carte.types";

import { BordDechire } from "../BordDechire";
import { CartePlat } from "../plats/CartePlat";
import { RangeeDefilante } from "../RangeeDefilante";
import { Section } from "../Section";

import { TeteBloc } from "./TeteBloc";

import { pluriel } from "@/lib/typo";

/**
 * « Promotions du moment » (maquette, HTML 123-135, retouche 5) : grandes
 * cartes en aplat orange, rangée qui défile sous 900 px, 3 par rangée
 * au-delà, puis le bord déchiré. Plats de la section Promotions de la carte
 * (promotion active et catégorie PROMOTIONS) ; section masquée s'il n'y en a
 * aucun.
 */
export function Promotions({ plats }: { plats: readonly IPlatCarte[] }) {
  if (plats.length === 0) return null;

  return (
    <Section
      className="pt-16 pb-[calc(max(100px,7.2vw)-4px)] lg:pt-22 lg:pb-[calc(max(100px,7.2vw)+4px)]"
      espacement="aucun"
      fond="jaune"
      id="promotions"
      titreId="promotions-titre"
    >
      <TeteBloc
        classeSousTitre="text-encre"
        lien={{ href: "/fr/carte#promotions", texte: "Toutes les promotions" }}
        sousTitre={`${pluriel(plats.length, "plat", "plats")} à prix réduit en ce moment.`}
        titre="Promotions du moment"
        titreId="promotions-titre"
      />
      <RangeeDefilante
        as="ul"
        colonnes={3}
        genre="promos"
        libelle="Promotions du moment"
      >
        {plats.map((plat) => (
          <li key={plat.id} className="flex min-w-0">
            <CartePlat className="w-full" plat={plat} variante="vitrine" />
          </li>
        ))}
      </RangeeDefilante>
      <BordDechire couleur="papier" />
    </Section>
  );
}
