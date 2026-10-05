"use client";

import type {
  IAdresseEnregistree,
  IAdresseLivraison,
  ISuggestionAdresse,
} from "../types/commande.types";

import Image from "next/image";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import {
  adresseDepuisPositionAction,
  detailsAdresseAction,
  enregistrerAdresseAction,
  listerAdressesAction,
  rechercherAdressesAction,
  supprimerAdresseAction,
} from "../actions/commande.action";
import { messageErreurAction } from "../utils/erreur-action.utils";

import { Bouton } from "@/components/site/Bouton";
import { ChampTexte, ChampZoneTexte } from "@/components/site/Champs";
import { ChoixRadio, GroupeChoix } from "@/components/site/Choix";
import { Icone } from "@/components/site/Icone";
import { Lien } from "@/components/site/Lien";
import { afficherMessage, annoncer } from "@/components/site/MessageFlottant";
import { INSECABLE } from "@/lib/typo";
import { cn } from "@/lib/utils";

const nouvelleSession = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now());

/** Même point (au mètre près) : l'adresse choisie vient de cette adresse enregistrée. */
const memePoint = (
  a: Pick<IAdresseLivraison, "latitude" | "longitude">,
  b: Pick<IAdresseEnregistree, "latitude" | "longitude">,
) =>
  a.latitude.toFixed(5) === b.latitude.toFixed(5) &&
  a.longitude.toFixed(5) === b.longitude.toFixed(5);

/**
 * Adresse de livraison (maquette, JS 1048-1110, CSS 1360-1384) : adresses
 * enregistrées du client (carnet partagé avec l'application), recherche avec
 * suggestions au clavier, position du téléphone, puis point de repère.
 *
 * Texte ET point GPS viennent toujours du même choix (cf. incident « les
 * clients se trompent d'adresse » côté application, où le texte et le point
 * pouvaient diverger). Le livreur suit le point.
 */
export default function AdresseLivraison({
  adresse,
  onChange,
  connecte,
  detail,
}: {
  adresse: IAdresseLivraison | null;
  onChange: (a: IAdresseLivraison | null) => void;
  /** Client connecté : ses adresses enregistrées sont proposées. */
  connecte: boolean;
  /** Sous l'adresse choisie : restaurant qui prépare, frais (étape Livraison ou retrait). */
  detail?: ReactNode;
}) {
  const id = useId();
  const [saisie, setSaisie] = useState("");
  const [suggestions, setSuggestions] = useState<ISuggestionAdresse[]>([]);
  const [active, setActive] = useState(-1);
  const [listeOuverte, setListeOuverte] = useState(false);
  const [rechercheVide, setRechercheVide] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [localisation, setLocalisation] = useState(false);
  const [enregistrees, setEnregistrees] = useState<IAdresseEnregistree[]>([]);
  const [nommer, setNommer] = useState(false);
  const [titre, setTitre] = useState("");
  const [envoiCarnet, setEnvoiCarnet] = useState(false);
  const [erreurCarnet, setErreurCarnet] = useState<string | null>(null);
  // Un jeton par recherche : Google facture la session entière comme un seul appel.
  const session = useRef(nouvelleSession());
  const champRecherche = useRef<HTMLInputElement>(null);
  const blocChoisi = useRef<HTMLDivElement>(null);
  const focusApres = useRef<"choisie" | "recherche" | null>(null);

  /**
   * Numéro du dernier geste du client (choix d'une adresse, position, « Changer »).
   * Un résultat arrivé après un geste plus récent est ignoré : la position GPS,
   * lente à venir, remplaçait sinon en silence l'adresse choisie entre-temps.
   * Le démontage (passage en retrait) compte aussi.
   */
  const geste = useRef(0);

  useEffect(
    () => () => {
      geste.current++;
    },
    [],
  );

  // Carnet du client, lu une fois : une erreur ne bloque rien, la recherche reste.
  useEffect(() => {
    if (!connecte) return setEnregistrees([]);
    let actif = true;

    listerAdressesAction()
      .then((res) => {
        if (actif && res.ok) setEnregistrees(res.data);
      })
      .catch(() => {
        /* carnet illisible : la recherche suffit */
      });

    return () => {
      actif = false;
    };
  }, [connecte]);

  useEffect(() => {
    setRechercheVide(false);
    if (adresse || saisie.trim().length < 3) {
      setSuggestions([]);
      setListeOuverte(false);

      return;
    }
    let actif = true;
    const t = setTimeout(async () => {
      try {
        const resultats = await rechercherAdressesAction(
          saisie,
          session.current,
        );

        if (!actif) return;
        setSuggestions(resultats);
        setActive(-1);
        setListeOuverte(resultats.length > 0);
        setRechercheVide(resultats.length === 0);
      } catch (e) {
        if (actif) setErreur(messageErreurAction(e));
      }
    }, 350);

    return () => {
      actif = false;
      clearTimeout(t);
    };
  }, [saisie, adresse]);

  // Focus après un changement d'écran demandé par le client.
  useEffect(() => {
    if (focusApres.current === "choisie" && adresse)
      blocChoisi.current?.focus();
    if (focusApres.current === "recherche" && !adresse)
      champRecherche.current?.focus();
    focusApres.current = null;
  }, [adresse]);

  const choisir = (a: Omit<IAdresseLivraison, "repere">) => {
    focusApres.current = "choisie";
    setSuggestions([]);
    setListeOuverte(false);
    setNommer(false);
    onChange({ ...a, repere: "" });
    annoncer(`Adresse choisie${INSECABLE}: ${a.libelle}.`);
  };

  const choisirSuggestion = async (s: ISuggestionAdresse) => {
    const n = ++geste.current;

    setErreur(null);
    setLocalisation(false);
    try {
      const res = await detailsAdresseAction(s.placeId, session.current);

      session.current = nouvelleSession();
      if (n !== geste.current) return;
      if (!res.ok) return setErreur(res.message);
      choisir(res.data);
    } catch (e) {
      if (n === geste.current) setErreur(messageErreurAction(e));
    }
  };

  const maPosition = () => {
    const n = ++geste.current;

    setErreur(null);
    if (!navigator.geolocation)
      return setErreur(
        "Votre navigateur ne donne pas votre position. Cherchez votre adresse.",
      );
    setLocalisation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (n !== geste.current) return;
        try {
          const res = await adresseDepuisPositionAction(
            pos.coords.latitude,
            pos.coords.longitude,
          );

          if (n !== geste.current) return;
          if (!res.ok) return setErreur(res.message);
          choisir(res.data);
        } catch (e) {
          if (n === geste.current) setErreur(messageErreurAction(e));
        } finally {
          if (n === geste.current) setLocalisation(false);
        }
      },
      () => {
        if (n !== geste.current) return;
        setLocalisation(false);
        setErreur(
          "Position refusée ou introuvable. Cherchez votre adresse à la place.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const changer = () => {
    geste.current++;
    focusApres.current = "recherche";
    setSaisie("");
    setLocalisation(false);
    setNommer(false);
    setErreurCarnet(null);
    onChange(null);
  };

  const enregistrer = async () => {
    if (!adresse || envoiCarnet) return;
    setErreurCarnet(null);
    setEnvoiCarnet(true);
    try {
      const res = await enregistrerAdresseAction({
        titre: titre.trim() || "Adresse",
        libelle: adresse.libelle,
        latitude: adresse.latitude,
        longitude: adresse.longitude,
      });

      if (!res.ok) return setErreurCarnet(res.message);
      setEnregistrees((avant) => [res.data, ...avant]);
      setNommer(false);
      setTitre("");
      afficherMessage("Adresse enregistrée dans votre compte.");
    } catch (e) {
      setErreurCarnet(messageErreurAction(e));
    } finally {
      setEnvoiCarnet(false);
    }
  };

  const supprimer = async (a: IAdresseEnregistree) => {
    setErreurCarnet(null);
    setEnvoiCarnet(true);
    try {
      const res = await supprimerAdresseAction(a.id);

      if (!res.ok) return setErreurCarnet(res.message);
      setEnregistrees((avant) => avant.filter((x) => x.id !== a.id));
      afficherMessage(`« ${a.titre} » retirée de vos adresses.`);
    } catch (e) {
      setErreurCarnet(messageErreurAction(e));
    } finally {
      setEnvoiCarnet(false);
    }
  };

  // ── Adresse choisie ─────────────────────────────────────────────────────
  if (adresse) {
    const duCarnet = enregistrees.find(
      (a) => memePoint(adresse, a) && a.libelle === adresse.libelle,
    );

    return (
      <div className="grid min-w-0 gap-3">
        <div
          ref={blocChoisi}
          className="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3 rounded-carte border-[1.5px] border-encre bg-surface [background-image:var(--motif-nappe)] [background-size:72px_72px] p-3.5 focus-visible:outline-offset-2"
          tabIndex={-1}
        >
          <Image
            alt=""
            className="h-11 w-11 object-contain"
            height={300}
            sizes="44px"
            src="/assets/site/icone-trajet.png"
            width={200}
          />
          <div className="grid min-w-0 gap-1 text-[13px] leading-[1.45] text-encre-doux">
            <p className="text-[15px] font-bold text-encre [overflow-wrap:anywhere]">
              {duCarnet ? `${duCarnet.titre} · ` : ""}
              {adresse.libelle}
            </p>
            {detail}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4">
          <Lien onClick={changer}>Changer d&apos;adresse</Lien>
          {connecte && duCarnet ? (
            <Lien disabled={envoiCarnet} onClick={() => supprimer(duCarnet)}>
              Retirer de mes adresses
            </Lien>
          ) : null}
          {connecte && !duCarnet && !nommer ? (
            <Lien
              onClick={() => {
                setNommer(true);
                setErreurCarnet(null);
              }}
            >
              Enregistrer dans mes adresses
            </Lien>
          ) : null}
        </div>
        {nommer ? (
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              enregistrer();
            }}
          >
            <ChampTexte
              autoComplete="off"
              classeBloc="min-w-0 flex-[1_1_180px]"
              id={`${id}-titre`}
              label="Nom de l'adresse"
              maxLength={40}
              placeholder="Maison, bureau…"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
            <Bouton
              aria-disabled={envoiCarnet || undefined}
              type="submit"
              variante="sombre"
            >
              Enregistrer
            </Bouton>
            <Lien onClick={() => setNommer(false)}>Annuler</Lien>
          </form>
        ) : null}
        {erreurCarnet ? (
          <p className="text-[13px] font-semibold text-rouge" role="alert">
            {erreurCarnet}
          </p>
        ) : null}
        <ChampZoneTexte
          id={`${id}-repere`}
          label={
            <>
              Point de repère{" "}
              <span className="font-normal text-encre-doux">(facultatif)</span>
            </>
          }
          maxLength={200}
          placeholder="Portail bleu, en face de la pharmacie…"
          rows={2}
          value={adresse.repere}
          onChange={(e) =>
            onChange({ ...adresse, repere: e.target.value.slice(0, 200) })
          }
        />
      </div>
    );
  }

  // ── Recherche ───────────────────────────────────────────────────────────
  const idListe = `${id}-suggestions`;
  const idOption = (i: number) => `${id}-suggestion-${i}`;

  return (
    <div className="grid min-w-0 gap-4">
      {enregistrees.length ? (
        <GroupeChoix legende="Vos adresses">
          {enregistrees.map((a) => (
            <ChoixRadio
              key={a.id}
              checked={false}
              detail={a.libelle}
              id={`${id}-enregistree-${a.id}`}
              label={a.titre}
              name={`${id}-enregistree`}
              value={a.id}
              onChange={() => choisir(a)}
            />
          ))}
        </GroupeChoix>
      ) : null}
      <div className="grid min-w-0 gap-1.5">
        <label className="text-sm font-semibold" htmlFor={`${id}-recherche`}>
          {enregistrees.length
            ? "Ou rechercher une adresse"
            : "Rechercher une adresse"}
        </label>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-0 flex-[1_1_260px]">
            <Icone
              className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-encre-doux"
              nom="loupe"
            />
            <input
              ref={champRecherche}
              aria-activedescendant={
                listeOuverte && active >= 0 ? idOption(active) : undefined
              }
              aria-autocomplete="list"
              aria-controls={idListe}
              aria-describedby={`${id}-aide`}
              aria-expanded={listeOuverte}
              autoComplete="off"
              autoCorrect="off"
              className="min-h-12 w-full min-w-0 rounded-xl border-[1.5px] border-trait-fort bg-white pr-3.5 pl-[42px] text-base text-encre placeholder:text-encre-doux/80 focus:border-encre focus-visible:outline-offset-1"
              id={`${id}-recherche`}
              placeholder="Quartier, rue ou lieu connu"
              role="combobox"
              spellCheck={false}
              type="text"
              value={saisie}
              onChange={(e) => {
                setSaisie(e.target.value);
                setErreur(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && suggestions.length) {
                  e.preventDefault();
                  setListeOuverte(true);
                  setActive((a) => (a + 1) % suggestions.length);
                } else if (e.key === "ArrowUp" && suggestions.length) {
                  e.preventDefault();
                  setListeOuverte(true);
                  setActive((a) => (a <= 0 ? suggestions.length : a) - 1);
                } else if (e.key === "Enter" && listeOuverte && active >= 0) {
                  e.preventDefault();
                  choisirSuggestion(suggestions[active]);
                } else if (e.key === "Escape" && listeOuverte) {
                  e.preventDefault();
                  setListeOuverte(false);
                  setActive(-1);
                }
              }}
            />
          </div>
          <Bouton
            aria-busy={localisation || undefined}
            className="max-[480px]:w-full"
            disabled={localisation}
            icone="viseur"
            variante="secondaire"
            onClick={maPosition}
          >
            {localisation
              ? "Recherche de votre position…"
              : "Utiliser ma position"}
          </Bouton>
        </div>
        <ul
          aria-label="Adresses proposées"
          className={cn(
            "mt-1.5 list-none overflow-hidden rounded-carte border border-trait bg-white shadow-1",
            !listeOuverte && "hidden",
          )}
          id={idListe}
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.placeId}
              aria-selected={i === active}
              className="grid min-h-11 cursor-pointer grid-cols-[22px_minmax(0,1fr)] items-center gap-2.5 border-t border-trait px-3.5 py-2.5 text-sm first:border-t-0 hover:bg-surface aria-selected:bg-surface"
              id={idOption(i)}
              role="option"
              tabIndex={-1}
              onClick={() => choisirSuggestion(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter") choisirSuggestion(s);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <Icone className="size-[18px] text-orange-texte" nom="repere" />
              <span className="min-w-0 [overflow-wrap:anywhere]">
                {s.principal}
                {s.secondaire ? (
                  <small className="block text-xs text-encre-doux">
                    {s.secondaire}
                  </small>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        {rechercheVide ? (
          <p className="text-[13px] text-encre-doux" role="status">
            Aucune adresse trouvée. Essayez le nom du quartier ou d&apos;un lieu
            connu à côté.
          </p>
        ) : null}
        <p
          className="text-[13px] leading-[1.45] text-encre-doux"
          id={`${id}-aide`}
        >
          Tapez au moins 3 lettres, puis choisissez l&apos;adresse dans la liste
          {INSECABLE}: le livreur suit le point choisi.
        </p>
        {erreur ? (
          <p className="text-[13px] font-semibold text-rouge" role="alert">
            {erreur}
          </p>
        ) : null}
      </div>
    </div>
  );
}
