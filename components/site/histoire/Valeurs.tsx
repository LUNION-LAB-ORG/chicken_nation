import { BordDechire } from "../BordDechire";
import { Icone, type NomIcone } from "../Icone";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

/** Les trois valeurs de l'ancienne page Histoire, avec les icônes du site. */
export const VALEURS: readonly {
  titre: string;
  texte: string;
  icone: NomIcone;
}[] = [
  {
    titre: "Qualité sans compromis",
    texte: "Nous sélectionnons rigoureusement nos ingrédients.",
    icone: "couronne",
  },
  {
    titre: "Innovation culinaire",
    texte: "Nos recettes sont régulièrement renouvelées.",
    icone: "feu",
  },
  {
    titre: "Service attentionné",
    texte: "Notre équipe est formée pour vous offrir le meilleur accueil.",
    icone: "amis",
  },
];

/** Nos valeurs : aplat orange étoilé, trois cartes, bord déchiré en bas. */
export function Valeurs() {
  return (
    <Section
      motif
      className="pt-12 pb-[calc(max(100px,7.2vw)+4px)] lg:pt-16"
      espacement="aucun"
      fond="orange"
      id="valeurs"
      titreId="valeurs-titre"
    >
      <div className="mx-auto mb-7 grid max-w-[40em] justify-items-center gap-2.5 text-center lg:mb-9">
        <TitreAffiche id="valeurs-titre">Nos valeurs</TitreAffiche>
        <p className="text-base font-medium">Des valeurs qui nous animent.</p>
      </div>
      <ul className="grid list-none gap-3 md:grid-cols-3 md:gap-4">
        {VALEURS.map((valeur) => (
          <li
            key={valeur.titre}
            className="grid content-start gap-2 rounded-carte bg-white p-5 shadow-1"
          >
            <span className="grid size-11 place-items-center rounded-full bg-jaune text-encre">
              <Icone className="size-6" nom={valeur.icone} />
            </span>
            <h3 className="mt-1 text-[17px] leading-[1.25] font-bold">
              {valeur.titre}
            </h3>
            <p className="text-sm leading-normal text-encre-doux">
              {valeur.texte}
            </p>
          </li>
        ))}
      </ul>
      <BordDechire />
    </Section>
  );
}
