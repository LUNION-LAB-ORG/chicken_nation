"use client";

import type { ICadeau, IPointsFidelite } from "../../types/commande.types";
import type { ReactNode } from "react";

import { useEffect, useId, useRef, useState } from "react";

import MesCadeaux from "../MesCadeaux";
import MesPoints from "../MesPoints";

import { classePanneau, ErreurEtape, TitreEtape } from "./EtapePanier";

import { Bouton } from "@/components/site/Bouton";
import { Lien } from "@/components/site/Lien";
import { fcfa, INSECABLE } from "@/lib/typo";

/**
 * Étape 4, les avantages (maquette, JS 1112-1199) : code promo ou bon
 * d'achat, OU points de fidélité (jamais les deux), et cadeaux gagnés en
 * plus. Toutes les règles sont celles du site : code vérifié par le serveur
 * (/promo-code/apply puis /voucher/client/check), points bornés par le
 * plafond et le solde, cadeaux contrôlés comme des plats.
 */
export function EtapeAvantages({
  code,
  onAppliquerCode,
  onRetirerCode,
  avisCode,
  points,
  sousTotal,
  pointsRetenus,
  remisePoints,
  avisPoints,
  onUtiliserPoints,
  onRetirerPoints,
  chargementFidelite,
  erreurFidelite,
  onRecharger,
  cadeaux,
  cadeauxChoisis,
  problemesCadeaux,
  panierPayant,
  onBasculerCadeau,
  demandeEpice,
  epices,
  onEpice,
  erreurEpice,
  erreur,
  pied,
}: {
  /** Code vérifié pour ce panier, ou null. */
  code: { code: string; remise: number } | null;
  /** Vérifie et applique un code ; renvoie le message d'erreur, ou null. */
  onAppliquerCode: (code: string) => Promise<string | null>;
  onRetirerCode: () => void;
  /** Phrase de non-cumul montrée dans le bloc du code. */
  avisCode: string | null;
  points: IPointsFidelite | null;
  sousTotal: number;
  pointsRetenus: number;
  remisePoints: number;
  /** Non-cumul ou « Points ajustés à N ». */
  avisPoints: string | null;
  onUtiliserPoints: (n: number) => void;
  onRetirerPoints: () => void;
  chargementFidelite: boolean;
  erreurFidelite: string | null;
  onRecharger: () => void;
  cadeaux: ICadeau[];
  cadeauxChoisis: string[];
  problemesCadeaux: Map<string, string[]>;
  /** Le panier a au moins un plat payant. */
  panierPayant: boolean;
  onBasculerCadeau: (id: string) => void;
  demandeEpice: (c: ICadeau) => boolean;
  epices: Record<string, boolean>;
  onEpice: (id: string, epice: boolean) => void;
  erreurEpice: string | null;
  erreur: string | null;
  pied: ReactNode;
}) {
  const id = useId();
  const [saisie, setSaisie] = useState("");
  const [erreurCode, setErreurCode] = useState<string | null>(null);
  const [verification, setVerification] = useState(false);

  /**
   * Le champ et son bloc « Code appliqué » se remplacent : après un geste du
   * client, le focus va à ce qui prend la place (« Retirer », ou le champ),
   * au lieu de retomber en haut de la page.
   */
  const gesteCode = useRef<"applique" | "retire" | null>(null);

  useEffect(() => {
    const geste = gesteCode.current;

    gesteCode.current = null;
    if (geste === "applique")
      document.getElementById(`${id}-retirer-code`)?.focus();
    if (geste === "retire") document.getElementById(`${id}-saisie`)?.focus();
  }, [code?.code, id]);

  const focaliserSaisie = () =>
    requestAnimationFrame(() =>
      document.getElementById(`${id}-saisie`)?.focus(),
    );

  const appliquer = async () => {
    if (verification) return;
    const c = saisie.trim().toUpperCase().replace(/\s+/g, "");

    if (!c) {
      setErreurCode("Entrez un code promo ou un bon d'achat.");

      return focaliserSaisie();
    }
    setErreurCode(null);
    setVerification(true);
    gesteCode.current = "applique";
    const message = await onAppliquerCode(c);

    setVerification(false);
    if (message) {
      // Le focus revient au champ à corriger, relié au message.
      gesteCode.current = null;
      setErreurCode(message);

      return focaliserSaisie();
    }
    setSaisie("");
  };

  return (
    <>
      <section aria-labelledby="t-etape" className={classePanneau}>
        <TitreEtape>Avantages</TitreEtape>
        <p className="text-sm leading-normal text-encre-doux">
          Un code promo ou vos points, au choix{INSECABLE}: les deux ne se
          cumulent pas. Les cadeaux gagnés s&apos;ajoutent en plus.
        </p>
      </section>

      <section aria-labelledby={`${id}-code`} className={classePanneau}>
        <h3 className="text-lg leading-tight font-bold" id={`${id}-code`}>
          Code promo ou bon d&apos;achat
        </h3>
        {code ? (
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-carte bg-ok-fond px-3.5 py-2 text-sm font-semibold text-ok">
            <span>
              Code {code.code} appliqué{INSECABLE}: {"−"}
              {fcfa(code.remise)}
            </span>
            <Lien
              className="text-encre"
              id={`${id}-retirer-code`}
              onClick={() => {
                gesteCode.current = "retire";
                onRetirerCode();
              }}
            >
              Retirer
            </Lien>
          </div>
        ) : (
          <form
            noValidate
            className="grid gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              appliquer();
            }}
          >
            <label className="sr-only" htmlFor={`${id}-saisie`}>
              Code promo ou bon d&apos;achat
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                aria-describedby={erreurCode ? `${id}-erreur` : undefined}
                aria-invalid={erreurCode ? true : undefined}
                autoCapitalize="characters"
                autoComplete="off"
                className="min-h-12 min-w-0 flex-[1_1_200px] rounded-xl border-[1.5px] border-trait-fort bg-white px-3.5 text-base text-encre uppercase placeholder:text-encre-doux/80 placeholder:normal-case focus:border-encre focus-visible:outline-offset-1 aria-invalid:border-rouge"
                id={`${id}-saisie`}
                maxLength={40}
                placeholder="Votre code"
                spellCheck={false}
                type="text"
                value={saisie}
                onChange={(e) => {
                  setSaisie(e.target.value);
                  setErreurCode(null);
                }}
              />
              {/* aria-disabled et non disabled : un bouton désactivé sous le
                  focus le perd (retour en haut de page au clavier). */}
              <Bouton
                aria-busy={verification || undefined}
                aria-disabled={verification || undefined}
                type="submit"
                variante="sombre"
              >
                {verification ? "Vérification…" : "Appliquer"}
              </Bouton>
            </div>
            {erreurCode ? (
              <p
                className="text-[13px] font-semibold text-rouge"
                id={`${id}-erreur`}
                role="alert"
              >
                {erreurCode}
              </p>
            ) : null}
          </form>
        )}
        {avisCode ? (
          <p
            className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm leading-[1.45]"
            role="status"
          >
            {avisCode}
          </p>
        ) : null}
      </section>

      <section aria-labelledby={`${id}-points`} className={classePanneau}>
        <h3 className="text-lg leading-tight font-bold" id={`${id}-points`}>
          Points de fidélité
        </h3>
        {points ? (
          <MesPoints
            avis={avisPoints}
            points={points}
            remise={remisePoints}
            retenus={pointsRetenus}
            sousTotal={sousTotal}
            onRetirer={onRetirerPoints}
            onUtiliser={onUtiliserPoints}
          />
        ) : chargementFidelite ? (
          <p className="text-sm text-encre-doux" role="status">
            Lecture de vos points…
          </p>
        ) : (
          <p className="text-sm text-encre-doux">
            Vos points ne sont pas disponibles pour le moment.
          </p>
        )}
      </section>

      <section aria-labelledby={`${id}-cadeaux`} className={classePanneau}>
        <h3 className="text-lg leading-tight font-bold" id={`${id}-cadeaux`}>
          Mes cadeaux
        </h3>
        {chargementFidelite && !cadeaux.length ? (
          <p className="text-sm text-encre-doux" role="status">
            Lecture de vos cadeaux…
          </p>
        ) : (
          <MesCadeaux
            actif={panierPayant}
            cadeaux={cadeaux}
            choisis={cadeauxChoisis}
            demandeEpice={demandeEpice}
            epices={epices}
            erreurEpice={erreurEpice}
            problemes={problemesCadeaux}
            onBasculer={onBasculerCadeau}
            onEpice={onEpice}
          />
        )}
      </section>

      {erreurFidelite ? (
        <p
          className="flex flex-wrap items-center gap-x-2 text-sm text-encre-doux"
          role="alert"
        >
          Points et cadeaux{INSECABLE}: {erreurFidelite}
          <Lien onClick={onRecharger}>Recharger</Lien>
        </p>
      ) : null}
      <ErreurEtape message={erreur} />
      {pied}
    </>
  );
}
