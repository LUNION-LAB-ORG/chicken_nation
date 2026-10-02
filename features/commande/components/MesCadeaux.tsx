"use client";

import Image from "next/image";
import { Button } from "@heroui/button";
import type { ICadeau } from "../types/commande.types";

const dateLisible = (iso: string) => {
  const d = new Date(iso);
  // Abidjan est à UTC+0.
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
};

/**
 * Bloc « Mes cadeaux » du panier : plats ou suppléments gagnés, ajoutés à
 * 0 F. Comme dans l'application, un cadeau ne se commande jamais seul.
 */
export default function MesCadeaux({
  cadeaux,
  choisis,
  problemes,
  actif,
  onBasculer,
}: {
  cadeaux: ICadeau[];
  /** Identifiants des cadeaux ajoutés à la commande. */
  choisis: string[];
  /** Ce qui empêche chaque cadeau dans le mode choisi, par identifiant. */
  problemes: Map<string, string[]>;
  /** Faux si le panier n'a aucun plat payant. */
  actif: boolean;
  onBasculer: (id: string) => void;
}) {
  return (
    <>
      <p className="text-sm text-gray-600">
        Le cadeau est réservé quand vous validez la commande. Si vous la modifiez, il vous est rendu.
      </p>
      {!actif && (
        <p className="rounded-xl bg-warning-50 p-3 text-sm text-warning-700">
          Ajoutez au moins un plat payant pour profiter d&apos;un cadeau.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {cadeaux.map((c) => {
          const choisi = choisis.includes(c.id);
          const raisons = problemes.get(c.id) ?? [];
          const jusquau = c.expireLe ? dateLisible(c.expireLe) : null;
          return (
            <li
              key={c.id}
              className={`flex items-center gap-3 rounded-xl border-2 p-2 ${choisi ? "border-primary bg-primary/10" : "border-gray-200"}`}
            >
              <div className="relative h-12 w-12 shrink-0">
                <Image src={c.image} alt="" fill sizes="48px" className="rounded-lg object-contain" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="font-semibold uppercase">{c.nom}</p>
                <p className="text-xs text-success-600">
                  {c.type === "SUPPLEMENT" ? "Supplément offert, servi avec un de vos plats" : "Offert"}
                  {jusquau ? `, valable jusqu'au ${jusquau}` : ""}
                </p>
                {raisons.map((r) => (
                  <p key={r} className="text-xs text-danger">
                    {r}
                  </p>
                ))}
              </div>
              <Button
                size="sm"
                color="primary"
                variant={choisi ? "bordered" : "solid"}
                aria-pressed={choisi}
                // Retirer reste toujours possible ; ajouter, seulement si le serveur l'acceptera.
                isDisabled={!choisi && (!actif || raisons.length > 0)}
                onPress={() => onBasculer(c.id)}
              >
                {choisi ? "Retirer" : "Ajouter"}
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
