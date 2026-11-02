import type { FormEvent, Ref } from "react";
import type { SaisieAvis, StoreAvis } from "../types/avis.types";
import type { ErreursExperience } from "../utils/regles-avis";

import { CANAUX, RESSENTIS } from "../types/avis.types";
import {
  COMMENTAIRE_MAX,
  LIBELLES_CANAUX,
  LIBELLES_RESSENTIS,
  TEXTES_AVIS,
  compteurCaracteres,
} from "../utils/textes-avis";

import { CorpsAvis, EnteteAvis, ID_TITRE_AVIS } from "./EnteteAvis";

import { Bouton } from "@/components/site/Bouton";
import { ChampSelection, ChampZoneTexte } from "@/components/site/Champs";
import { cn } from "@/lib/utils";

const T = TEXTES_AVIS.experience;

export type ChangerSaisie = <K extends keyof SaisieAvis>(
  champ: K,
  valeur: SaisieAvis[K],
) => void;

/** id du premier choix de ressenti (focus sur l'erreur). */
export const idRessenti = (code: string) => `avis-ressenti-${code}`;

/**
 * Écran 2, étape 1 : ressenti (trois tuiles, aucune choisie d'avance), canal
 * de commande, store (lus dans l'API, plus « Je ne sais pas ») et commentaire
 * de 1 000 caractères au plus.
 */
export function EcranExperience({
  saisie,
  stores,
  erreurs,
  refTitre,
  onChanger,
  onContinuer,
  onRetour,
}: {
  saisie: SaisieAvis;
  stores: StoreAvis[];
  erreurs: ErreursExperience;
  refTitre?: Ref<HTMLHeadingElement>;
  onChanger: ChangerSaisie;
  onContinuer: (evenement: FormEvent<HTMLFormElement>) => void;
  onRetour: () => void;
}) {
  return (
    <>
      <EnteteAvis
        etape={T.etape}
        refTitre={refTitre}
        titre={T.titre}
        onRetour={onRetour}
      />
      <CorpsAvis>
        <form
          noValidate
          aria-labelledby={ID_TITRE_AVIS}
          className="grid gap-[22px]"
          method="post"
          onSubmit={onContinuer}
        >
          <fieldset
            aria-describedby={
              erreurs.ressenti ? "avis-ressenti-erreur" : undefined
            }
            className="grid min-w-0 gap-2.5"
          >
            <legend className="mb-2.5 text-base font-bold">{T.legende}</legend>
            <div className="grid grid-cols-3 gap-2">
              {RESSENTIS.map((code) => (
                <div key={code} className="relative grid">
                  <input
                    checked={saisie.ressenti === code}
                    className="peer absolute size-px opacity-0"
                    id={idRessenti(code)}
                    name="ressenti"
                    type="radio"
                    value={code}
                    onChange={() => onChanger("ressenti", code)}
                  />
                  <label
                    className={cn(
                      "grid min-h-14 cursor-pointer place-items-center rounded-carte border-[1.5px] border-trait-fort bg-white px-1 py-2 text-center text-[14px] leading-tight font-semibold text-encre transition-colors duration-150",
                      "hover:border-encre peer-checked:border-2 peer-checked:border-encre peer-checked:bg-orange-pale",
                      "peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--focus) peer-focus-visible:outline-solid",
                      erreurs.ressenti && "border-rouge",
                    )}
                    htmlFor={idRessenti(code)}
                  >
                    {LIBELLES_RESSENTIS[code]}
                  </label>
                </div>
              ))}
            </div>
            {erreurs.ressenti ? (
              <p
                className="text-[13px] font-semibold text-rouge"
                id="avis-ressenti-erreur"
                role="alert"
              >
                {erreurs.ressenti}
              </p>
            ) : null}
          </fieldset>

          <ChampSelection
            required
            erreur={erreurs.canal}
            id="avis-canal"
            label={T.canal}
            name="canal"
            value={saisie.canal}
            onChange={(e) =>
              onChanger("canal", e.target.value as SaisieAvis["canal"])
            }
          >
            <option value="">{T.choisir}</option>
            {CANAUX.map((code) => (
              <option key={code} value={code}>
                {LIBELLES_CANAUX[code]}
              </option>
            ))}
          </ChampSelection>

          <ChampSelection
            id="avis-store"
            label={T.store}
            name="store"
            value={saisie.restaurantId}
            onChange={(e) => onChanger("restaurantId", e.target.value)}
          >
            <option value="">{T.jeNeSaisPas}</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.nom}
              </option>
            ))}
          </ChampSelection>

          <ChampZoneTexte
            required
            aide={
              <span className="block text-right tabular-nums">
                {compteurCaracteres(saisie.commentaire.length)}
              </span>
            }
            className="min-h-36"
            erreur={erreurs.commentaire}
            id="avis-commentaire"
            label={T.commentaire}
            maxLength={COMMENTAIRE_MAX}
            name="commentaire"
            placeholder={T.indication}
            rows={5}
            value={saisie.commentaire}
            onChange={(e) => onChanger("commentaire", e.target.value)}
          />

          <Bouton bloc taille="grand" type="submit">
            {T.bouton}
          </Bouton>
        </form>
      </CorpsAvis>
    </>
  );
}
