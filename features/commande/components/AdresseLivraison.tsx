"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { LocateFixed, MapPin } from "lucide-react";
import {
  adresseDepuisPositionAction,
  detailsAdresseAction,
  rechercherAdressesAction,
} from "../actions/commande.action";
import type { IAdresseLivraison, ISuggestionAdresse } from "../types/commande.types";
import { messageErreurAction } from "../utils/erreur-action.utils";

const nouvelleSession = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());

/**
 * Adresse de livraison : texte ET point GPS viennent toujours du même choix
 * (cf. incident « les clients se trompent d'adresse » côté application, où le
 * texte et le point pouvaient diverger). Le livreur suit le point.
 */
export default function AdresseLivraison({
  adresse,
  onChange,
}: {
  adresse: IAdresseLivraison | null;
  onChange: (a: IAdresseLivraison | null) => void;
}) {
  const [saisie, setSaisie] = useState("");
  const [suggestions, setSuggestions] = useState<ISuggestionAdresse[]>([]);
  const [rechercheVide, setRechercheVide] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [localisation, setLocalisation] = useState(false);
  // Un jeton par recherche : Google facture la session entière comme un seul appel.
  const session = useRef(nouvelleSession());

  /**
   * Numéro du dernier geste du client (choix d'une adresse, position, « Modifier »).
   * Un résultat arrivé après un geste plus récent est ignoré : la position GPS,
   * lente à venir, remplaçait sinon en silence l'adresse choisie entre-temps
   * et son indication. Le démontage (passage à « À emporter ») compte aussi.
   */
  const geste = useRef(0);
  useEffect(
    () => () => {
      geste.current++;
    },
    [],
  );

  useEffect(() => {
    setRechercheVide(false);
    if (adresse || saisie.trim().length < 3) return setSuggestions([]);
    let actif = true;
    const t = setTimeout(async () => {
      try {
        const resultats = await rechercherAdressesAction(saisie, session.current);
        if (!actif) return;
        setSuggestions(resultats);
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

  const choisir = async (s: ISuggestionAdresse) => {
    const n = ++geste.current;
    setErreur(null);
    setLocalisation(false);
    try {
      const res = await detailsAdresseAction(s.placeId, session.current);
      session.current = nouvelleSession();
      if (n !== geste.current) return;
      if (!res.ok) return setErreur(res.message);
      setSuggestions([]);
      onChange({ ...res.data, repere: "" });
    } catch (e) {
      if (n === geste.current) setErreur(messageErreurAction(e));
    }
  };

  const maPosition = () => {
    const n = ++geste.current;
    setErreur(null);
    if (!navigator.geolocation) return setErreur("Votre navigateur ne donne pas votre position. Cherchez votre adresse.");
    setLocalisation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (n !== geste.current) return;
        try {
          const res = await adresseDepuisPositionAction(pos.coords.latitude, pos.coords.longitude);
          if (n !== geste.current) return;
          if (!res.ok) return setErreur(res.message);
          onChange({ ...res.data, repere: "" });
        } catch (e) {
          if (n === geste.current) setErreur(messageErreurAction(e));
        } finally {
          if (n === geste.current) setLocalisation(false);
        }
      },
      () => {
        if (n !== geste.current) return;
        setLocalisation(false);
        setErreur("Position refusée ou introuvable. Cherchez votre adresse à la place.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  if (adresse) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 rounded-xl border border-primary bg-primary/5 p-4">
          <p className="flex gap-2 text-sm">
            <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
            <span>{adresse.libelle}</span>
          </p>
          <button
            type="button"
            className="shrink-0 text-sm font-semibold text-primary underline"
            onClick={() => {
              geste.current++;
              setSaisie("");
              setLocalisation(false);
              onChange(null);
            }}
          >
            Modifier
          </button>
        </div>
        <Input
          label="Indication pour la livraison (facultatif)"
          placeholder="Ex. : portail bleu en face de la pharmacie"
          value={adresse.repere}
          onValueChange={(repere) => onChange({ ...adresse, repere })}
          maxLength={200}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        label="Adresse de livraison"
        placeholder="Quartier, rue, immeuble…"
        value={saisie}
        onValueChange={setSaisie}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />
      {suggestions.length > 0 && (
        <ul className="overflow-hidden rounded-xl border border-gray-200" role="listbox" aria-label="Adresses proposées">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => choisir(s)}
                className="flex w-full flex-col items-start px-4 py-3 text-left text-sm hover:bg-gray-50"
              >
                <span className="font-medium">{s.principal}</span>
                {s.secondaire && <span className="text-gray-500">{s.secondaire}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {rechercheVide && (
        <p className="text-sm text-gray-500">Aucune adresse trouvée. Essayez le nom du quartier ou d&apos;un lieu connu à côté.</p>
      )}
      <Button variant="bordered" startContent={<LocateFixed size={18} />} isLoading={localisation} onPress={maPosition}>
        Utiliser ma position actuelle
      </Button>
      {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
    </div>
  );
}
