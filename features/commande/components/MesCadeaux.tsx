"use client";

import type { ICadeau } from "../types/commande.types";

import { ChoixEpice } from "./ChoixEpice";

import { Bouton } from "@/components/site/Bouton";
import { PhotoPlat } from "@/components/site/PhotoPlat";
import { photoPlat } from "@/features/menus/photo-plat";
import { INSECABLE, joli } from "@/lib/typo";
import { cn } from "@/lib/utils";

const dateLisible = (iso: string) => {
  const d = new Date(iso);

  // Abidjan est à UTC+0.
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      });
};

/**
 * Cadeaux gagnés au Gratte et Gagne de l'application (maquette, JS
 * 1161-1180) : plats ou suppléments ajoutés à 0 FCFA. Comme dans
 * l'application, un cadeau ne se commande jamais seul. Un plat offert qui
 * se sert épicé ou non demande le choix du client, sans valeur par défaut.
 */
export default function MesCadeaux({
  cadeaux,
  choisis,
  problemes,
  actif,
  onBasculer,
  demandeEpice,
  epices,
  onEpice,
  erreurEpice,
}: {
  cadeaux: ICadeau[];
  /** Identifiants des cadeaux ajoutés à la commande. */
  choisis: string[];
  /** Ce qui empêche chaque cadeau dans le mode choisi, par identifiant. */
  problemes: Map<string, string[]>;
  /** Faux si le panier n'a aucun plat payant. */
  actif: boolean;
  onBasculer: (id: string) => void;
  /** Vrai si ce cadeau (plat offert) demande « épicé ou non ». */
  demandeEpice: (c: ICadeau) => boolean;
  /** Épicé ou non choisi, par identifiant de cadeau. */
  epices: Record<string, boolean>;
  onEpice: (id: string, epice: boolean) => void;
  /** Identifiant du cadeau dont le choix manque, quand le client a voulu continuer. */
  erreurEpice: string | null;
}) {
  if (!cadeaux.length) {
    return (
      <p className="text-[13px] leading-[1.45] text-encre-doux">
        Aucun cadeau pour le moment. Après chaque commande payée en ligne, une
        carte à gratter vous attend dans l&apos;application Chicken Nation
        {INSECABLE}: elle cache parfois un plat ou une boisson offerts.
      </p>
    );
  }

  return (
    <>
      <p className="text-[13px] leading-[1.45] text-encre-doux">
        Gagnés au Gratte et Gagne de l&apos;application. Un cadeau accompagne
        toujours une commande payante, jamais seul. Il est réservé au moment du
        paiement, et rendu si vous modifiez la commande avant de payer.
      </p>
      {!actif ? (
        <p className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm">
          Ajoutez au moins un plat payant pour profiter d&apos;un cadeau.
        </p>
      ) : null}
      <ul className="grid list-none gap-2.5">
        {cadeaux.map((c) => {
          const choisi = choisis.includes(c.id);
          const raisons = problemes.get(c.id) ?? [];
          const jusquau = c.expireLe ? dateLisible(c.expireLe) : null;
          const photo = photoPlat(
            c.type === "PLAT" ? c.articleId : "",
            c.image,
          );
          // Plat : son nom tel quel (comme sur la carte) ; supplément : nom adouci.
          const base = c.nom.replace(/\s+offerte?$/i, "").trim() || c.nom;
          const nom = c.type === "PLAT" ? base : joli(base);

          return (
            <li
              key={c.id}
              className={cn(
                "grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 rounded-carte border-[1.5px] border-dashed border-trait-fort bg-white p-3",
                "min-[560px]:grid-cols-[64px_minmax(0,1fr)_auto]",
                choisi && "border-solid border-ok bg-ok-fond",
              )}
            >
              <PhotoPlat
                alt=""
                className="size-16 rounded-photo"
                etiquette={false}
                fond={photo.fond}
                marge={4}
                sizes="64px"
                src={photo.src}
              />
              <div className="grid min-w-0 gap-1">
                <p className="text-[15px] leading-tight font-bold [overflow-wrap:anywhere]">
                  {nom} offert
                </p>
                <p className="text-[12.5px] text-encre-doux">
                  {c.type === "SUPPLEMENT"
                    ? "Ajouté à un plat payant qui ne l'a pas déjà"
                    : `Plat offert, ajouté à 0${INSECABLE}FCFA`}
                  {jusquau ? `, valable jusqu'au ${jusquau}` : ""}
                </p>
                {raisons.map((r) => (
                  <p key={r} className="text-[12.5px] font-semibold text-rouge">
                    {r}
                  </p>
                ))}
              </div>
              {choisi && demandeEpice(c) ? (
                <ChoixEpice
                  className="col-span-full min-[560px]:col-start-2"
                  erreur={
                    erreurEpice === c.id
                      ? "Choisissez épicé ou non épicé."
                      : null
                  }
                  id={`cadeau-${c.id}`}
                  legende={`Épicé ou non, pour ${nom}${INSECABLE}?`}
                  valeur={c.id in epices ? epices[c.id] : null}
                  onChange={(e) => onEpice(c.id, e)}
                />
              ) : null}
              <div className="col-span-full flex flex-wrap items-center gap-2 min-[560px]:col-span-1 min-[560px]:col-start-3 min-[560px]:row-start-1 min-[560px]:justify-end">
                <Bouton
                  aria-pressed={choisi}
                  // Retirer reste toujours possible ; ajouter, seulement si le serveur l'acceptera.
                  disabled={!choisi && (!actif || raisons.length > 0)}
                  taille="petit"
                  variante={choisi ? "secondaire" : "sombre"}
                  onClick={() => onBasculer(c.id)}
                >
                  {choisi ? "Retirer" : "Ajouter à ma commande"}
                </Bouton>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
