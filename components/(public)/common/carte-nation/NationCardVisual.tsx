import Image from "next/image";

/**
 * Visuel stylisé de la Carte de la Nation — 100% CSS + logo, aucun asset à
 * maintenir. Utilisé par la page d'adhésion (colonne de gauche, inclinée) et
 * par l'écran de succès (droite). Le POINT de la page : montrer l'objet que
 * le visiteur est en train de demander.
 */
export default function NationCardVisual({
  cardLabel,
  memberLabel,
  tilted = true,
  className = "",
}: {
  cardLabel: string;
  memberLabel: string;
  tilted?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Carte jaune décalée derrière — effet pile de cartes */}
      <div
        aria-hidden
        className={`absolute inset-0 rounded-2xl bg-secondary ${
          tilted ? "rotate-[4deg] translate-x-2 translate-y-2" : "translate-x-1.5 translate-y-1.5"
        }`}
      />

      {/* Carte principale */}
      <div
        className={`relative aspect-[1.6/1] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#ff6200] via-primary to-[#d94f00] shadow-2xl ${
          tilted ? "-rotate-[3deg]" : ""
        }`}
      >
        {/* Rayures diagonales (signature des bannières CN) */}
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(255,255,255,0.6)_12px,rgba(255,255,255,0.6)_24px)]" />
        {/* Éclat haut-droite */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
          {/* Haut : logo + puce */}
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-white p-1.5 shadow-md">
              <Image
                src="/assets/images/logo.png"
                alt="Chicken Nation"
                width={44}
                height={44}
                className="h-9 w-9 object-contain sm:h-11 sm:w-11"
              />
            </div>
            {/* Puce de carte */}
            <div className="mt-1 h-7 w-9 rounded-md bg-gradient-to-br from-secondary to-yellow-500 shadow-inner ring-1 ring-black/10" />
          </div>

          {/* Milieu : -20% */}
          <div className="flex items-end gap-2">
            <span className="font-title text-5xl font-bold leading-none tracking-wide text-secondary drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)] sm:text-6xl">
              -20%
            </span>
          </div>

          {/* Bas : nom de la carte + porteur */}
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-title text-lg uppercase leading-tight tracking-widest text-white sm:text-xl">
                {cardLabel}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                {memberLabel}
              </p>
            </div>
            <p className="pb-0.5 font-mono text-xs tracking-[0.3em] text-white/70">
              •••• 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
