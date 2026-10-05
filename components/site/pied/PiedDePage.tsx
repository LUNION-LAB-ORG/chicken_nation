import Link from "next/link";

import Image from "../Image";
import { Ancre } from "../Ancre";
import { BordDechire } from "../BordDechire";
import { Icone } from "../Icone";
import { Conteneur } from "../Section";
import { LIENS_PIED } from "../entete/liens";

import { INSECABLE, TELEPHONE, telLien } from "@/lib/typo";

const RESEAUX = [
  {
    nom: "Facebook",
    icone: "facebook",
    href: "https://www.facebook.com/chickennationabj",
  },
  {
    nom: "Instagram",
    icone: "instagram",
    href: "https://www.instagram.com/chickennationabj/?hl=fr",
  },
] as const;

/**
 * Pied de page (maquette, HTML 394-431, CSS 847-879) : bandeau jaune
 * (restaurants, horaires, réseaux), puis bloc sombre au bord déchiré avec le
 * numéro unique, les liens du site et la mention LUNION-LAB (retouche 4).
 * Composant serveur, sans aucun JavaScript.
 */
export function PiedDePage() {
  return (
    <footer className="relative text-white">
      <div className="border-t-[3px] border-encre bg-jaune pt-4 pb-[66px] text-encre">
        <Conteneur className="flex flex-wrap items-center justify-between gap-x-7 gap-y-2.5">
          <p className="flex min-w-0 items-center gap-2.5 text-sm leading-[1.35] font-semibold">
            <Icone className="size-6" nom="repere" />
            <span>
              Chicken Nation Marcory Zone{INSECABLE}4, Angré, Sococé, Faya et
              Yopougon
            </span>
          </p>
          <p className="flex min-w-0 items-center gap-2.5 text-sm leading-[1.35] font-semibold">
            <Image
              alt=""
              className="size-6 shrink-0 object-contain"
              height={50}
              sizes="24px"
              src="/assets/site/icone-horloge.png"
              width={52}
            />
            <span>
              Tous les jours dès 10{INSECABLE}h, jusqu&apos;à minuit ou 1
              {INSECABLE}h selon le jour
            </span>
          </p>
          <ul
            aria-label="Chicken Nation sur les réseaux sociaux"
            className="flex list-none gap-2"
          >
            {RESEAUX.map((r) => (
              <li key={r.nom}>
                <Ancre
                  nouvelOnglet
                  className="grid size-11 place-items-center rounded-full bg-encre text-jaune hover:bg-encre-forte hover:text-white"
                  href={r.href}
                >
                  <Icone nom={r.icone} />
                  <span className="sr-only">{r.nom}</span>
                </Ancre>
              </li>
            ))}
          </ul>
        </Conteneur>
      </div>

      <div className="relative bg-encre pt-1.5 pb-[26px] [--focus:var(--color-jaune)]">
        <BordDechire aplati haut couleur="encre" />
        <Conteneur>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-[18px] lg:grid-cols-[auto_auto_minmax(0,1fr)] lg:gap-10">
            <Image
              alt="Chicken Nation"
              className="block h-16 w-auto lg:h-[76px]"
              height={300}
              sizes="52px"
              src="/assets/site/logo-blanc.png"
              width={203}
            />
            <div>
              <p className="text-[13px] text-sur-encre-doux">
                Commandes par téléphone, 7 jours sur 7
              </p>
              <a
                className="mt-1 block w-fit font-affiche text-[clamp(36px,9vw,58px)] leading-none whitespace-nowrap text-jaune no-underline [font-synthesis:none] hover:underline hover:underline-offset-4"
                href={telLien()}
              >
                {TELEPHONE}
              </a>
            </div>
            <nav
              aria-label="Liens du pied de page"
              className="col-span-full lg:col-span-1"
            >
              <ul className="flex list-none flex-wrap gap-x-5 lg:ml-auto lg:max-w-[540px] lg:justify-end">
                {LIENS_PIED.map((lien) => (
                  <li key={lien.href}>
                    <Link
                      className="inline-flex min-h-10 items-center text-[15px] font-semibold text-white no-underline hover:text-jaune hover:underline hover:underline-offset-[5px]"
                      href={lien.href}
                      // Douze liens : pas de préchargement de chaque page
                      // quand le pied de page entre à l'écran.
                      prefetch={false}
                    >
                      {lien.libelle}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-5 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-trait-sombre pt-3.5 text-[13px] text-sur-encre-doux lg:mt-7 lg:pt-[18px]">
            <p>
              Poulet 100{INSECABLE}% local, 100{INSECABLE}% halal. Vous voulez
              ouvrir un Chicken Nation{INSECABLE}?{" "}
              <Link
                className="font-semibold text-sur-encre-doux underline underline-offset-[3px] hover:text-jaune"
                href="/fr/histoire#franchise"
                prefetch={false}
              >
                La franchise est possible.
              </Link>
            </p>
            <p>
              © {new Date().getFullYear()} Chicken Nation, Abidjan{" "}
              <span aria-hidden="true">·</span> Développé par{" "}
              <Ancre
                nouvelOnglet
                className="font-semibold text-sur-encre-doux underline underline-offset-[3px] hover:text-jaune"
                href="https://lunion-lab.com"
              >
                LUNION-LAB
              </Ancre>
            </p>
          </div>
        </Conteneur>
      </div>
    </footer>
  );
}
