import Image from "next/image";

import { Ruban, Surtitre } from "../Autocollants";
import { Section } from "../Section";
import { TitreAffiche } from "../TitreAffiche";

import { INSECABLE } from "@/lib/typo";

/**
 * D'où vient Chicken Nation : le texte « À propos » de l'ancienne page
 * Histoire et le récit du père Champion de l'ancienne page Franchise,
 * avec la photo de l'élevage local.
 */
export function Origine() {
  return (
    <Section id="origine" titreId="origine-titre">
      <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
        <div className="grid min-w-0 gap-4">
          <Surtitre>D&apos;où vient Chicken Nation</Surtitre>
          <TitreAffiche id="origine-titre">
            Du bon, du frais, du champion
          </TitreAffiche>
          <div className="grid max-w-[38em] gap-3 text-base">
            <p>
              <strong>Chicken Nation, le champion du poulet{INSECABLE}!</strong>{" "}
              Ici, on ne rigole pas avec la qualité.
            </p>
            <p>
              <strong>Notre secret{INSECABLE}?</strong> Un poulet 100
              {INSECABLE}% local, élevé dans nos propres fermes, nourri avec
              soin et préparé avec passion.
            </p>
            <p>
              <strong>Et en cuisine{INSECABLE}?</strong> On le marine avec
              amour, on l&apos;enrobe d&apos;une panure dorée et croustillante,
              puis on le frit jusqu&apos;à la perfection, pour un équilibre
              parfait entre tendre et croquant.
            </p>
            <p>
              Un goût authentique, généreux et unique, né en Côte d&apos;Ivoire.
            </p>
          </div>
          <figure className="mt-2 grid max-w-[38em] gap-2 rounded-carte border-l-4 border-orange bg-surface px-5 py-4">
            <blockquote>
              <p className="text-[15px] leading-[1.6] font-medium italic">
                «{INSECABLE}Moi, c&apos;est le père Champion dans poulet
                {INSECABLE}! Parti d&apos;un petit village, je suis venu me
                chercher à Abidjan et j&apos;ai créé Chicken Nation.
                Aujourd&apos;hui, notre poulet pané fait croustiller des
                milliers de gourmands, et bientôt, il y en aura partout dans la
                ville{INSECABLE}!{INSECABLE}»
              </p>
            </blockquote>
            <figcaption className="text-sm font-bold text-orange-texte">
              Le père Champion dans poulet
            </figcaption>
          </figure>
        </div>
        <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
          <div className="overflow-hidden rounded-panneau border-[6px] border-white bg-creme shadow-photo max-[419px]:border-4">
            {/* Sur ordinateur, cette photo est dans le premier écran et c'est
                l'image principale mesurée : chargée tout de suite, sans
                attendre le défilement. Priorité basse : React ne la précharge
                pas (sur téléphone, elle est plus bas et le fond de l'en-tête
                reste la seule image préchargée). */}
            <Image
              alt="Poule blanche à crête rouge, dans l'herbe"
              className="block aspect-[1200/791] h-auto w-full object-cover"
              fetchPriority="low"
              height={791}
              loading="eager"
              sizes="(min-width: 1264px) 500px, (min-width: 900px) 40vw, (min-width: 552px) 520px, calc(100vw - 32px)"
              src="/assets/site/histoire-poule.webp"
              width={1200}
            />
          </div>
          <Ruban className="absolute -bottom-3 left-3 md:-bottom-4 md:left-5">
            Élevé dans nos propres fermes
          </Ruban>
        </div>
      </div>
    </Section>
  );
}
