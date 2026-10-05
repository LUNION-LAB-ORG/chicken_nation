"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./RangeeDefilante.module.css";

import { cn } from "@/lib/utils";

/**
 * Rangée de cartes : défile au doigt avec accroche sous 900 px, grille de
 * `colonnes` colonnes au-delà. Atteignable au clavier (tabindex 0) seulement
 * quand elle déborde, pour qu'on puisse la faire défiler aux flèches.
 */
export function RangeeDefilante({
  as: Balise = "div",
  libelle,
  colonnes = 3,
  genre,
  className,
  children,
}: {
  /** ul quand les enfants sont des li. */
  as?: "div" | "ul";
  /** Nom de la rangée, lu quand elle reçoit le focus. */
  libelle: string;
  colonnes?: 2 | 3 | 4;
  genre?: "promos" | "avis";
  className?: string;
  children: ReactNode;
}) {
  // Convient aux deux balises possibles (div ou ul).
  const ref = useRef<HTMLDivElement & HTMLUListElement>(null);
  const [deborde, setDeborde] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el || typeof ResizeObserver === "undefined") return;
    const mesurer = () => setDeborde(el.scrollWidth > el.clientWidth + 2);
    const observateur = new ResizeObserver(mesurer);

    observateur.observe(el);
    mesurer();

    return () => observateur.disconnect();
  }, []);

  return (
    <Balise
      ref={ref}
      aria-label={deborde ? libelle : undefined}
      className={cn(styles.rangee, genre && styles[genre], className)}
      style={{ "--colonnes": colonnes } as CSSProperties}
      tabIndex={deborde ? 0 : undefined}
    >
      {children}
    </Balise>
  );
}
