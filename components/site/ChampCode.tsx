"use client";

import {
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
} from "react";

import { cn } from "@/lib/utils";

/**
 * Code reçu sur WhatsApp, en cases (maquette, CSS 1329-1337, JS 1715-1731) :
 * passage automatique à la case suivante, collage du code entier (aussi par
 * la suggestion du clavier, autocomplete one-time-code), effacement arrière
 * qui revient à la case précédente. onComplet part quand toutes les cases
 * sont remplies.
 */
export function ChampCode({
  id,
  valeur,
  onChange,
  onComplet,
  longueur = 4,
  legende = `Code à ${longueur} chiffres`,
  erreur,
  desactive,
  focusAuDebut,
  className,
}: {
  id: string;
  valeur: string;
  onChange: (code: string) => void;
  onComplet?: (code: string) => void;
  longueur?: number;
  legende?: string;
  erreur?: string | null;
  /**
   * Vérification en cours : cases en lecture seule, mais JAMAIS désactivées
   * (une case désactivée perd le focus, et le clavier du téléphone se ferme).
   */
  desactive?: boolean;
  /** Met le focus sur la première case à l'affichage (étape du code). */
  focusAuDebut?: boolean;
  className?: string;
}) {
  const cases = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (focusAuDebut) cases.current[0]?.focus();
  }, [focusAuDebut]);

  const chiffres = Array.from({ length: longueur }, (_, i) => valeur[i] ?? "");

  const aller = (i: number) => {
    const cible = cases.current[Math.max(0, Math.min(longueur - 1, i))];

    cible?.focus();
    cible?.select();
  };

  /** Écrit `saisie` à partir de la case `depart` et passe à la suite. */
  const ecrire = (depart: number, saisie: string) => {
    if (desactive) return;
    const nouveaux = [...chiffres];
    const recus = saisie.replace(/\D/g, "").slice(0, longueur - depart);

    if (!recus) {
      nouveaux[depart] = "";
    } else {
      recus.split("").forEach((c, k) => {
        nouveaux[depart + k] = c;
      });
    }
    const code = nouveaux.join("");

    onChange(code);
    if (recus) aller(depart + recus.length);
    if (code.length === longueur && nouveaux.every(Boolean)) onComplet?.(code);
  };

  const surTouche = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (desactive && e.key === "Backspace") return e.preventDefault();
    if (e.key === "Backspace" && !chiffres[i] && i > 0) {
      e.preventDefault();
      const nouveaux = [...chiffres];

      nouveaux[i - 1] = "";
      onChange(nouveaux.join(""));
      aller(i - 1);
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      aller(i - 1);
    } else if (e.key === "ArrowRight" && i < longueur - 1) {
      e.preventDefault();
      aller(i + 1);
    }
  };

  const surCollage = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    ecrire(i, e.clipboardData.getData("text"));
  };

  return (
    <fieldset className={cn("grid min-w-0 gap-1.5", className)}>
      <legend className="mb-1.5 text-sm font-semibold">{legende}</legend>
      <div className="flex gap-2.5">
        {chiffres.map((chiffre, i) => (
          <input
            key={i}
            ref={(el) => {
              cases.current[i] = el;
            }}
            aria-busy={desactive || undefined}
            aria-describedby={erreur ? `${id}-erreur` : undefined}
            aria-invalid={erreur ? true : undefined}
            aria-label={`Chiffre ${i + 1} sur ${longueur}`}
            autoComplete={i === 0 ? "one-time-code" : "off"}
            className="h-16 w-[clamp(48px,15vw,58px)] rounded-[14px] border-[1.5px] border-trait-fort bg-white p-0 text-center text-[26px] font-bold tabular-nums read-only:bg-surface focus:border-encre focus-visible:outline-offset-1 aria-invalid:border-rouge"
            id={i === 0 ? id : `${id}-${i}`}
            inputMode="numeric"
            pattern="[0-9]*"
            readOnly={desactive}
            type="text"
            value={chiffre}
            onChange={(e) => {
              const v = e.target.value;

              // Plusieurs chiffres d'un coup (suggestion du clavier) : le code entier.
              // Sinon, le chiffre tapé remplace celui de la case.
              ecrire(i, v.length > 2 ? v : v.replace(chiffre, "") || v);
            }}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => surTouche(i, e)}
            onPaste={(e) => surCollage(i, e)}
          />
        ))}
      </div>
      {erreur ? (
        <p
          className="text-[13px] font-semibold text-rouge"
          id={`${id}-erreur`}
          role="alert"
        >
          {erreur}
        </p>
      ) : null}
    </fieldset>
  );
}
