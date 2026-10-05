import type { ComponentPropsWithRef, ReactNode } from "react";

import { Ancre } from "./Ancre";
import { Icone, type NomIcone } from "./Icone";

import { cn } from "@/lib/utils";

const styleLien =
  "inline-flex min-h-11 items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-semibold text-orange-texte underline decoration-[1.5px] underline-offset-[3px] hover:text-encre disabled:cursor-default disabled:text-encre-doux disabled:no-underline";

type LienProps = {
  /** Sans adresse, le lien est un bouton (« Modifier », « Renvoyer le code »). */
  href?: string;
  nouvelOnglet?: boolean;
  icone?: NomIcone;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithRef<"button">, "children">;

/** Lien souligné orange (texte orange foncé, contraste suffisant sur le papier). */
export function Lien({
  href,
  nouvelOnglet,
  icone,
  className,
  children,
  type = "button",
  ...props
}: LienProps) {
  const contenu = (
    <>
      {icone ? <Icone className="size-[18px]" nom={icone} /> : null}
      {children}
    </>
  );

  if (href) {
    return (
      <Ancre
        className={cn(styleLien, className)}
        href={href}
        nouvelOnglet={nouvelOnglet}
      >
        {contenu}
      </Ancre>
    );
  }

  return (
    <button className={cn(styleLien, className)} type={type} {...props}>
      {contenu}
    </button>
  );
}

/** Lien de bloc avec une flèche qui glisse de 3 px au survol (« Toute la carte → »). */
export function LienFleche({
  href,
  nouvelOnglet,
  className,
  children,
}: {
  href: string;
  nouvelOnglet?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Ancre
      className={cn(
        "group inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold whitespace-nowrap text-encre no-underline underline-offset-4 hover:underline",
        className,
      )}
      href={href}
      nouvelOnglet={nouvelOnglet}
    >
      {children}
      <Icone
        className="size-[18px] transition-transform duration-150 motion-safe:group-hover:translate-x-[3px]"
        nom="fleche"
      />
    </Ancre>
  );
}
