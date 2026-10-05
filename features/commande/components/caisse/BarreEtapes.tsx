"use client";

import type { EtapeCaisse } from "../../utils/caisse.utils";

import { atom, useAtomValue, useSetAtom } from "jotai";

import { allerEtapeAtom } from "../../stores/caisse.store";
import { ETAPES_CAISSE } from "../../utils/caisse.utils";

import { Icone } from "@/components/site/Icone";
import { cn } from "@/lib/utils";

/**
 * État de la barre des étapes, écrit par la caisse (Caisse.tsx) : la barre
 * est dans l'en-tête orange, rendu par la page, et la caisse plus bas. Avant
 * que la caisse ne l'écrive (rendu serveur, première peinture), la barre
 * montre l'étape 1 et rien d'autre de cliquable : aucun décalage à l'arrivée.
 */
export interface IBarreCaisse {
  /** Étape affichée. */
  actuelle: EtapeCaisse;
  /** Étape la plus avancée possible (caisse.utils, etapeMaximale). */
  max: EtapeCaisse;
  /** Étapes faites (coche). */
  faites: EtapeCaisse[];
  /** Libellé de l'étape 3 : « Livraison » ou « Retrait » une fois le panier rempli. */
  libelle3: string;
}

export const barreCaisseAtom = atom<IBarreCaisse>({
  actuelle: 1,
  max: 1,
  faites: [],
  libelle3: "Livraison ou retrait",
});

/** Demande de passage à une étape depuis la barre ; la caisse s'occupe du focus. */
export const etapeDemandeeAtom = atom(0);

/**
 * Barre des 5 étapes (maquette, JS 845-856, CSS 1213-1240) : pilules
 * cliquables jusqu'à l'étape la plus avancée possible, coche sur les étapes
 * faites. Sous 900 px, seul le libellé de l'étape en cours s'affiche ; le
 * nom complet de chaque étape reste lu (aria-label).
 */
export function BarreEtapes() {
  const { actuelle, max, faites, libelle3 } = useAtomValue(barreCaisseAtom);
  const aller = useSetAtom(allerEtapeAtom);
  const demander = useSetAtom(etapeDemandeeAtom);

  return (
    <ol
      aria-label="Étapes de la commande"
      className="mt-4 flex list-none items-center gap-[3px] min-[375px]:gap-1.5"
    >
      {ETAPES_CAISSE.map(({ numero, libelle }) => {
        const estActuelle = numero === actuelle;
        const faite = !estActuelle && faites.includes(numero);
        const accessible = !estActuelle && numero <= max;
        const texte = numero === 3 ? libelle3 : libelle;

        return (
          <li
            key={numero}
            className={cn(
              "flex min-w-0 items-center gap-[3px] min-[375px]:gap-1.5",
              // Trait entre deux étapes.
              numero > 1 &&
                "before:h-0.5 before:w-[5px] before:flex-none before:bg-encre/28 before:content-[''] min-[375px]:before:w-2 lg:before:w-3.5",
            )}
          >
            <button
              aria-current={estActuelle ? "step" : undefined}
              aria-label={`Étape ${numero} sur 5, ${texte}${faite ? ", faite" : ""}`}
              className={cn(
                "group relative inline-flex min-h-10 items-center gap-2 rounded-pilule border-0 p-[3px] text-sm font-semibold whitespace-nowrap min-[375px]:p-1 lg:pr-3.5",
                // Cible tactile de 44 px autour de la pilule, sans la grossir.
                "after:absolute after:inset-x-[-5px] after:inset-y-[-2px] after:content-['']",
                "bg-white/22 text-encre enabled:hover:bg-white disabled:cursor-default",
                faite &&
                  "bg-encre text-white enabled:hover:bg-encre-clair disabled:text-white",
                estActuelle &&
                  "bg-white pr-3 font-bold shadow-bouton min-[375px]:pr-3.5",
              )}
              disabled={!accessible}
              type="button"
              onClick={() => {
                aller(numero);
                demander((n) => n + 1);
              }}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-7 flex-none place-items-center rounded-full bg-white text-[13px] font-bold text-encre tabular-nums min-[375px]:size-8 min-[375px]:text-sm",
                  faite && "bg-orange text-encre",
                  estActuelle && "bg-encre text-white",
                )}
              >
                {faite ? <Icone className="size-4" nom="coche" /> : numero}
              </span>
              <span
                aria-hidden="true"
                className={cn(!estActuelle && "max-lg:hidden")}
              >
                {texte}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
