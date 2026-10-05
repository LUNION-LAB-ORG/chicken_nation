"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

import { Bouton } from "../Bouton";
import { ChampTexte, ChampZoneTexte } from "../Champs";
import { Icone } from "../Icone";

import {
  CHAMPS_CONTACT,
  erreurChamp,
  LONGUEURS_MAX,
  VALEURS_VIDES,
  verifierContact,
  type ChampContact,
  type ErreursContact,
  type SujetContact,
  type ValeursContact,
} from "./contact.regles";

import { TELEPHONE, telLien } from "@/lib/typo";
import { cn } from "@/lib/utils";

type Etat = "saisie" | "envoi" | "envoye";

/** Échec de l'envoi : texte affiché sous le bouton. */
type Echec = "limite" | "refus" | "panne" | null;

const TEXTES: Record<
  SujetContact,
  { message: string; bouton: string; merci: string }
> = {
  contact: {
    message: "Votre message",
    bouton: "Envoyer le message",
    merci: "Merci, votre message est bien envoyé.",
  },
  franchise: {
    message: "Votre projet de franchise",
    bouton: "Envoyer ma demande",
    merci: "Merci, votre demande de franchise est bien envoyée.",
  },
};

/**
 * Formulaire de la page Contact et de la section franchise de Notre
 * histoire. Il envoie à /api/send-email avec son `sujet`, qui fixe l'objet
 * du courriel reçu (« Message du site » ou « Demande de franchise »).
 * Champs vérifiés avant l'envoi avec les règles de la route ; le champ piège
 * `site_web` reste vide pour un humain.
 */
export function FormulaireContact({
  sujet,
  titreId,
  className,
}: {
  sujet: SujetContact;
  /** id du titre qui nomme le formulaire. */
  titreId?: string;
  className?: string;
}) {
  const [valeurs, setValeurs] = useState<ValeursContact>(VALEURS_VIDES);
  const [erreurs, setErreurs] = useState<ErreursContact>({});
  const [tente, setTente] = useState(false);
  const [etat, setEtat] = useState<Etat>("saisie");
  const [echec, setEchec] = useState<Echec>(null);
  const piege = useRef<HTMLInputElement>(null);
  const formulaire = useRef<HTMLFormElement>(null);
  const merci = useRef<HTMLDivElement>(null);
  const retourAuFormulaire = useRef(false);

  // Le remerciement prend la place du formulaire : le focus y va. Au retour
  // au formulaire (« Écrire un autre message »), il revient au premier champ.
  useEffect(() => {
    if (etat === "envoye") merci.current?.focus();
    if (etat === "saisie" && retourAuFormulaire.current) {
      retourAuFormulaire.current = false;
      formulaire.current?.querySelector<HTMLElement>("input")?.focus();
    }
  }, [etat]);

  const textes = TEXTES[sujet];
  const id = (champ: string) => `${sujet}-${champ}`;

  function changer(champ: ChampContact, valeur: string) {
    setValeurs((avant) => ({ ...avant, [champ]: valeur }));
    // Après une première tentative, l'erreur suit la saisie.
    if (tente) {
      setErreurs((avant) => ({
        ...avant,
        [champ]: erreurChamp(champ, valeur) ?? undefined,
      }));
    }
  }

  async function envoyer(evenement: FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (etat === "envoi") return;

    const trouvees = verifierContact(valeurs);

    setTente(true);
    setErreurs(trouvees);
    setEchec(null);

    const premier = CHAMPS_CONTACT.find((champ) => trouvees[champ]);

    if (premier) {
      formulaire.current
        ?.querySelector<HTMLElement>(`#${id(premier)}`)
        ?.focus();

      return;
    }

    setEtat("envoi");

    try {
      const reponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...valeurs,
          sujet,
          site_web: piege.current?.value ?? "",
        }),
      });
      const resultat = (await reponse.json().catch(() => null)) as {
        success?: boolean;
      } | null;

      if (reponse.ok && resultat?.success) {
        setValeurs(VALEURS_VIDES);
        setTente(false);
        setEtat("envoye");

        return;
      }

      setEchec(
        reponse.status === 429
          ? "limite"
          : reponse.status === 400
            ? "refus"
            : "panne",
      );
    } catch {
      setEchec("panne");
    }

    setEtat("saisie");
  }

  if (etat === "envoye") {
    return (
      <div
        ref={merci}
        className={cn(
          // Marge de défilement : le focus ne le cache pas sous l'en-tête collant.
          "grid scroll-mt-[calc(var(--h-entete)+16px)] justify-items-start gap-3 rounded-carte border border-ok/30 bg-ok-fond p-5 text-encre",
          className,
        )}
        role="status"
        tabIndex={-1}
      >
        <p className="flex items-center gap-2.5 text-[17px] leading-[1.3] font-bold">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ok text-white">
            <Icone className="size-5" nom="coche" />
          </span>
          {textes.merci}
        </p>
        <p className="text-[15px]">
          Notre équipe reviendra vers vous dans les plus brefs délais.
        </p>
        <Bouton
          variante="secondaire"
          onClick={() => {
            retourAuFormulaire.current = true;
            setEtat("saisie");
          }}
        >
          Écrire un autre message
        </Bouton>
      </div>
    );
  }

  const envoiEnCours = etat === "envoi";

  return (
    <form
      ref={formulaire}
      noValidate
      aria-busy={envoiEnCours || undefined}
      aria-labelledby={titreId}
      className={cn("grid gap-4", className)}
      // Envoi par fetch ; « post » garde les données hors de l'adresse si
      // le formulaire part avant que le JavaScript soit prêt.
      method="post"
      onSubmit={envoyer}
    >
      <p className="text-[13px] text-encre-doux">
        Tous les champs sont obligatoires.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <ChampTexte
          required
          autoComplete="family-name"
          erreur={erreurs.nom}
          id={id("nom")}
          label="Nom"
          maxLength={LONGUEURS_MAX.nom}
          name="nom"
          value={valeurs.nom}
          onChange={(e) => changer("nom", e.target.value)}
        />
        <ChampTexte
          required
          autoComplete="given-name"
          erreur={erreurs.prenom}
          id={id("prenom")}
          label="Prénom"
          maxLength={LONGUEURS_MAX.prenom}
          name="prenom"
          value={valeurs.prenom}
          onChange={(e) => changer("prenom", e.target.value)}
        />
        <ChampTexte
          required
          autoCapitalize="none"
          autoComplete="email"
          erreur={erreurs.email}
          id={id("email")}
          inputMode="email"
          label="Adresse électronique"
          maxLength={LONGUEURS_MAX.email}
          name="email"
          spellCheck={false}
          type="email"
          value={valeurs.email}
          onChange={(e) => changer("email", e.target.value)}
        />
        <ChampTexte
          required
          autoComplete="tel"
          erreur={erreurs.telephone}
          id={id("telephone")}
          inputMode="tel"
          label="Téléphone"
          maxLength={LONGUEURS_MAX.telephone}
          name="telephone"
          type="tel"
          value={valeurs.telephone}
          onChange={(e) => changer("telephone", e.target.value)}
        />
      </div>
      <ChampZoneTexte
        required
        className="min-h-40"
        erreur={erreurs.message}
        id={id("message")}
        label={textes.message}
        maxLength={LONGUEURS_MAX.message}
        name="message"
        value={valeurs.message}
        onChange={(e) => changer("message", e.target.value)}
      />

      {/* Champ piège : jamais affiché, rempli seulement par les robots. */}
      <div hidden>
        <label htmlFor={id("site-web")}>Site web, à laisser vide</label>
        <input
          ref={piege}
          autoComplete="off"
          defaultValue=""
          id={id("site-web")}
          name="site_web"
          tabIndex={-1}
          type="text"
        />
      </div>

      <div className="grid gap-3">
        <Bouton
          aria-disabled={envoiEnCours || undefined}
          className="w-full sm:w-fit"
          iconeFin={envoiEnCours ? undefined : "fleche"}
          taille="grand"
          type="submit"
        >
          {envoiEnCours ? "Envoi en cours…" : textes.bouton}
        </Bouton>
        {echec ? (
          <p
            className="rounded-xl bg-rouge-fond px-3.5 py-3 text-sm font-semibold text-rouge"
            role="alert"
          >
            {echec === "limite" ? (
              "Trop de messages envoyés depuis votre connexion. Réessayez dans quelques minutes."
            ) : echec === "refus" ? (
              "Le formulaire contient une erreur. Vérifiez les champs, puis réessayez."
            ) : (
              <>
                L&apos;envoi n&apos;a pas abouti. Réessayez plus tard, ou
                appelez le{" "}
                <a
                  className="whitespace-nowrap text-rouge underline underline-offset-[3px]"
                  href={telLien()}
                >
                  {TELEPHONE}
                </a>
                .
              </>
            )}
          </p>
        ) : null}
      </div>
    </form>
  );
}
