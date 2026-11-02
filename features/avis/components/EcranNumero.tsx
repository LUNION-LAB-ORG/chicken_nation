import type { FormEvent, Ref } from "react";
import type { SaisieAvis } from "../types/avis.types";
import type { ErreursNumero } from "../utils/regles-avis";
import type { ChangerSaisie } from "./EcranExperience";

import { PRENOM_MAX, TELEPHONE_MAX, TEXTES_AVIS } from "../utils/textes-avis";

import { CorpsAvis, EnteteAvis, ID_TITRE_AVIS } from "./EnteteAvis";

import { Bouton } from "@/components/site/Bouton";
import { ChampTexte } from "@/components/site/Champs";
import { CaseACocher } from "@/components/site/Choix";
import { TELEPHONE, telLien } from "@/lib/typo";

const T = TEXTES_AVIS.numero;

/**
 * Écran 3, étape 2 : numéro mobile (pour retrouver les commandes du client),
 * prénom facultatif, accord de rappel jamais coché d'avance, puis l'envoi.
 * Le champ piège `site_web` reste vide pour un humain.
 */
export function EcranNumero({
  saisie,
  erreurs,
  envoi,
  echec,
  refTitre,
  refPiege,
  onChanger,
  onEnvoyer,
  onRetour,
}: {
  saisie: SaisieAvis;
  erreurs: ErreursNumero;
  /** Envoi en cours : bouton désactivé. */
  envoi: boolean;
  /** Message d'échec de l'envoi (API, limite, connexion). */
  echec: string | null;
  refTitre?: Ref<HTMLHeadingElement>;
  refPiege?: Ref<HTMLInputElement>;
  onChanger: ChangerSaisie;
  onEnvoyer: (evenement: FormEvent<HTMLFormElement>) => void;
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
          aria-busy={envoi || undefined}
          aria-labelledby={ID_TITRE_AVIS}
          className="grid gap-5"
          method="post"
          onSubmit={onEnvoyer}
        >
          <p className="text-[15px] leading-[1.6]">{T.intro}</p>

          <ChampTexte
            required
            aide={T.aideTelephone}
            autoComplete="tel-national"
            erreur={erreurs.telephone}
            id="avis-telephone"
            inputMode="tel"
            label={T.telephone}
            maxLength={TELEPHONE_MAX}
            name="telephone"
            prefixe="+225"
            type="tel"
            value={saisie.telephone}
            onChange={(e) => onChanger("telephone", e.target.value)}
          />

          <ChampTexte
            autoComplete="given-name"
            erreur={erreurs.prenom}
            id="avis-prenom"
            label={
              <>
                {T.prenom}{" "}
                <span className="font-normal text-encre-doux">
                  {T.facultatif}
                </span>
              </>
            }
            maxLength={PRENOM_MAX}
            name="prenom"
            placeholder={T.indicationPrenom}
            type="text"
            value={saisie.prenom}
            onChange={(e) => onChanger("prenom", e.target.value)}
          />

          <CaseACocher
            checked={saisie.accordRappel}
            id="avis-rappel"
            label={T.accord}
            name="accord_rappel"
            onChange={(e) => onChanger("accordRappel", e.target.checked)}
          />

          {/* Champ piège : jamais affiché, rempli seulement par les robots. */}
          <div hidden>
            <label htmlFor="avis-site-web">Site web, à laisser vide</label>
            <input
              ref={refPiege}
              autoComplete="off"
              defaultValue=""
              id="avis-site-web"
              name="site_web"
              tabIndex={-1}
              type="text"
            />
          </div>

          <div className="mt-1 grid gap-3">
            <Bouton
              bloc
              aria-busy={envoi || undefined}
              disabled={envoi}
              taille="grand"
              type="submit"
            >
              {envoi ? T.envoi : T.bouton}
            </Bouton>
            {echec ? (
              <p
                className="rounded-xl bg-rouge-fond px-3.5 py-3 text-sm font-semibold text-rouge"
                role="alert"
              >
                {echec}
              </p>
            ) : null}
            <p className="text-center text-[12.5px] leading-normal text-encre-doux">
              {T.mentionDebut}
              <a
                className="font-semibold whitespace-nowrap text-encre-doux underline underline-offset-[3px] hover:text-encre"
                href={telLien()}
              >
                {TELEPHONE}
              </a>
              .
            </p>
          </div>
        </form>
      </CorpsAvis>
    </>
  );
}
