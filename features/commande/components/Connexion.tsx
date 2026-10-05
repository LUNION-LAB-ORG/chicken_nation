"use client";

import type { IClient } from "../types/commande.types";

import { useEffect, useRef, useState } from "react";

import {
  completerProfilAction,
  deconnexionAction,
  demanderCodeAction,
  verifierCodeAction,
} from "../actions/connexion.action";
import { messageErreurAction } from "../utils/erreur-action.utils";
import { telephoneLisible } from "../utils/panier.utils";

import { Bouton } from "@/components/site/Bouton";
import { ChampCode } from "@/components/site/ChampCode";
import { ChampTexte } from "@/components/site/Champs";
import { Lien } from "@/components/site/Lien";
import { afficherMessage } from "@/components/site/MessageFlottant";
import { INSECABLE } from "@/lib/typo";
import { cn } from "@/lib/utils";

export type EtapeConnexion = "telephone" | "code" | "profil";

const RENVOI_S = 30;

/**
 * Connexion par code reçu sur WhatsApp, avec le même compte que l'application
 * (maquette, JS 925-1013). Un numéro inconnu crée le compte ; on demande
 * alors le prénom et le nom.
 *
 * `etapeInitiale="profil"` : client déjà connecté (cookie posé au code validé)
 * mais sans prénom ou nom, parce qu'il a quitté la page avant cette étape. Sa
 * connexion n'est pas finie : on reprend au nom, jamais on ne commande sans.
 *
 * Deux formes :
 *  - par défaut, un panneau avec son titre (suivi, Mes commandes) ;
 *  - `integree` : le contenu seul, dans le panneau « Connexion » de la caisse.
 *
 * Le bouton WhatsApp tient sur une ligne dès 320 px (retouche 14) : sa police
 * suit la largeur du formulaire (requête de conteneur), entre 12,5 et 16 px.
 */
export default function Connexion({
  onConnecte,
  etapeInitiale = "telephone",
  integree = false,
}: {
  onConnecte: (client: IClient) => void;
  etapeInitiale?: "telephone" | "profil";
  integree?: boolean;
}) {
  const [etape, setEtape] = useState<EtapeConnexion>(etapeInitiale);
  const [saisie, setSaisie] = useState("");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [attente, setAttente] = useState(0);
  // Numéro vérifié pendant cette visite (et non profil repris d'une visite précédente).
  const [verifie, setVerifie] = useState(false);

  /**
   * Le focus va au premier champ quand l'étape change par un geste du client,
   * jamais au chargement de la page (il volerait le défilement).
   */
  const geste = useRef(false);
  const champTelephone = useRef<HTMLInputElement>(null);
  const champPrenom = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!geste.current) return;
    if (etape === "telephone") champTelephone.current?.focus();
    if (etape === "profil") champPrenom.current?.focus();
  }, [etape]);

  useEffect(() => {
    if (attente <= 0) return;
    const t = setTimeout(() => setAttente((a) => a - 1), 1000);

    return () => clearTimeout(t);
  }, [attente]);

  const allerA = (suivante: EtapeConnexion) => {
    geste.current = true;
    setErreur(null);
    setEtape(suivante);
  };

  /** Appel d'une action serveur : bouton jamais bloqué, message si le réseau lâche. */
  const appeler = async (action: () => Promise<void>) => {
    if (chargement) return;
    setErreur(null);
    setChargement(true);
    try {
      await action();
    } catch (e) {
      setErreur(messageErreurAction(e));
    } finally {
      setChargement(false);
    }
  };

  const envoyerCode = () =>
    appeler(async () => {
      const res = await demanderCodeAction(
        etape === "telephone" ? saisie : telephone,
      );

      if (!res.ok) return setErreur(res.message);
      setTelephone(res.data.telephone);
      setCode("");
      setAttente(RENVOI_S);
      if (etape === "code") {
        afficherMessage("Nouveau code envoyé sur WhatsApp.");
      } else {
        allerA("code");
        afficherMessage(
          `Code envoyé sur WhatsApp au ${telephoneLisible(res.data.telephone)}.`,
        );
      }
    });

  const verifier = (saisi: string = code) =>
    appeler(async () => {
      if (!/^\d{4}$/.test(saisi.trim()))
        return setErreur("Entrez les 4 chiffres reçus sur WhatsApp.");
      const res = await verifierCodeAction(telephone, saisi.trim());

      if (!res.ok) return setErreur(res.message);
      if (!res.data.first_name || !res.data.last_name) {
        setVerifie(true);

        return allerA("profil");
      }
      afficherMessage(
        `Connecté : ${res.data.first_name} ${res.data.last_name}.`,
      );
      onConnecte(res.data);
    });

  const enregistrerProfil = () =>
    appeler(async () => {
      const res = await completerProfilAction(prenom, nom);

      if (!res.ok) return setErreur(res.message);
      afficherMessage(`Bienvenue, ${res.data.first_name}${INSECABLE}!`);
      onConnecte(res.data);
    });

  // Session d'un autre numéro restée sur l'appareil : on la ferme et on recommence.
  const changerDeNumero = () =>
    appeler(async () => {
      await deconnexionAction();
      setSaisie("");
      allerA("telephone");
    });

  const titre = (texte: string) =>
    integree ? null : (
      <h2 className="text-xl leading-tight font-bold">{texte}</h2>
    );
  const messageErreur = erreur ? (
    <p className="text-[13px] font-semibold text-rouge" role="alert">
      {erreur}
    </p>
  ) : null;

  const contenu =
    etape === "telephone" ? (
      <form
        noValidate
        className="@container grid max-w-[460px] gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          envoyerCode();
        }}
      >
        {titre("Connectez-vous pour commander")}
        <p className="text-sm leading-normal text-encre-doux">
          Pas de mot de passe{INSECABLE}: nous vous envoyons un code à 4
          chiffres sur WhatsApp. Si vous avez l&apos;application Chicken Nation,
          c&apos;est le même compte.
        </p>
        <ChampTexte
          ref={champTelephone}
          required
          aide="Numéro ivoirien à 10 chiffres, qui commence par 07, 05 ou 01."
          autoComplete="tel-national"
          erreur={erreur}
          id="cx-tel"
          inputMode="tel"
          label="Votre numéro WhatsApp"
          maxLength={20}
          prefixe="+225"
          type="tel"
          value={saisie}
          onChange={(e) => {
            setSaisie(e.target.value);
            if (erreur) setErreur(null);
          }}
        />
        <Bouton
          bloc
          aria-busy={chargement || undefined}
          className="gap-1.5 px-2.5 text-[length:clamp(12.5px,calc((100cqw_-_44px)/17.4),16px)]"
          disabled={chargement}
          icone="whatsapp"
          taille="grand"
          type="submit"
        >
          {chargement ? "Envoi du code…" : "Recevoir mon code sur WhatsApp"}
        </Bouton>
      </form>
    ) : etape === "code" ? (
      <form
        noValidate
        className="grid max-w-[460px] gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          verifier();
        }}
      >
        {titre("Saisissez le code")}
        <p className="text-sm leading-normal">
          Code envoyé sur WhatsApp au{" "}
          <strong className="whitespace-nowrap">
            {telephoneLisible(telephone).replace(/ /g, INSECABLE)}
          </strong>
          .{" "}
          <Lien className="min-h-0" onClick={() => allerA("telephone")}>
            Modifier le numéro
          </Lien>
        </p>
        <ChampCode
          focusAuDebut
          desactive={chargement}
          erreur={erreur}
          id="cx-code"
          valeur={code}
          onChange={(c) => {
            setCode(c);
            if (erreur) setErreur(null);
          }}
          onComplet={(c) => verifier(c)}
        />
        <Bouton
          bloc
          aria-busy={chargement || undefined}
          disabled={chargement}
          taille="grand"
          type="submit"
        >
          {chargement ? "Vérification…" : "Valider"}
        </Bouton>
        <p className="text-[13px] leading-normal text-encre-doux">
          Pas reçu{INSECABLE}?{" "}
          <Lien
            className="min-h-0 text-[13px]"
            disabled={attente > 0 || chargement}
            onClick={envoyerCode}
          >
            {attente > 0
              ? `Renvoyer le code dans ${attente}${INSECABLE}s`
              : "Renvoyer le code"}
          </Lien>
        </p>
      </form>
    ) : (
      <form
        noValidate
        className="grid max-w-[460px] gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          enregistrerProfil();
        }}
      >
        {titre(`Bienvenue dans la Nation${INSECABLE}!`)}
        {verifie ? (
          <p className="rounded-carte bg-ok-fond px-3.5 py-3 text-sm leading-normal font-semibold text-ok">
            Numéro vérifié. Bienvenue chez Chicken Nation.
          </p>
        ) : null}
        <p className="text-sm leading-normal text-encre-doux">
          Comment vous appelez-vous{INSECABLE}? Le restaurant et le livreur
          utiliseront ce nom.
        </p>
        <div className="grid gap-3 min-[420px]:grid-cols-2">
          <ChampTexte
            ref={champPrenom}
            required
            autoComplete="given-name"
            id="cx-prenom"
            label="Prénom"
            maxLength={60}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
          <ChampTexte
            required
            autoComplete="family-name"
            id="cx-nom"
            label="Nom"
            maxLength={60}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>
        {messageErreur}
        <Bouton
          bloc
          aria-busy={chargement || undefined}
          disabled={chargement}
          taille="grand"
          type="submit"
        >
          {chargement ? "Enregistrement…" : "Continuer"}
        </Bouton>
        <Lien
          className="justify-self-start text-[13px]"
          disabled={chargement}
          onClick={changerDeNumero}
        >
          Ce n&apos;est pas votre numéro{INSECABLE}? Changer de numéro
        </Lien>
      </form>
    );

  if (integree) return contenu;

  return (
    <section
      aria-label="Connexion"
      className={cn(
        "grid w-full min-w-0 gap-4 rounded-panneau border border-trait bg-white py-5 shadow-1",
        "px-3 min-[360px]:px-[18px] md:px-7 md:py-[26px]",
      )}
    >
      {contenu}
    </section>
  );
}
