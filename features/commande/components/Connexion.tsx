"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { completerProfilAction, demanderCodeAction, verifierCodeAction } from "../actions/connexion.action";
import type { IClient } from "../types/commande.types";
import { telephoneLisible } from "../utils/panier.utils";

type Etape = "telephone" | "code" | "profil";

/**
 * Connexion par code reçu sur WhatsApp, avec le même compte que l'application.
 * Un numéro inconnu crée le compte ; on demande alors le prénom et le nom.
 */
export default function Connexion({ onConnecte }: { onConnecte: (client: IClient) => void }) {
  const [etape, setEtape] = useState<Etape>("telephone");
  const [saisie, setSaisie] = useState("");
  const [telephone, setTelephone] = useState("");
  const [code, setCode] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [attente, setAttente] = useState(0);

  useEffect(() => {
    if (attente <= 0) return;
    const t = setTimeout(() => setAttente((a) => a - 1), 1000);
    return () => clearTimeout(t);
  }, [attente]);

  const envoyerCode = async () => {
    setErreur(null);
    setChargement(true);
    const res = await demanderCodeAction(etape === "telephone" ? saisie : telephone);
    setChargement(false);
    if (!res.ok) return setErreur(res.message);
    setTelephone(res.data.telephone);
    setCode("");
    setEtape("code");
    setAttente(30);
  };

  const verifier = async () => {
    setErreur(null);
    setChargement(true);
    const res = await verifierCodeAction(telephone, code.trim());
    setChargement(false);
    if (!res.ok) return setErreur(res.message);
    if (!res.data.first_name || !res.data.last_name) return setEtape("profil");
    onConnecte(res.data);
  };

  const enregistrerProfil = async () => {
    setErreur(null);
    setChargement(true);
    const res = await completerProfilAction(prenom, nom);
    setChargement(false);
    if (!res.ok) return setErreur(res.message);
    onConnecte(res.data);
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
      {etape === "telephone" && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            envoyerCode();
          }}
        >
          <h2 className="text-xl font-bold">Connectez-vous pour commander</h2>
          <p className="text-sm text-gray-600">
            Nous vous envoyons un code sur WhatsApp. Si vous avez déjà l&apos;application CHICKEN NATION, c&apos;est le même compte.
          </p>
          <Input
            label="Numéro WhatsApp"
            placeholder="07 00 00 00 00"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            startContent={<span className="text-sm text-gray-500">+225</span>}
            value={saisie}
            onValueChange={setSaisie}
            isRequired
          />
          {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
          <Button type="submit" color="primary" className="font-semibold" isLoading={chargement}>
            Recevoir le code
          </Button>
        </form>
      )}

      {etape === "code" && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            verifier();
          }}
        >
          <h2 className="text-xl font-bold">Saisissez le code</h2>
          <p className="text-sm text-gray-600">
            Code envoyé sur WhatsApp au {telephoneLisible(telephone)}.{" "}
            <button type="button" className="font-semibold text-primary underline" onClick={() => setEtape("telephone")}>
              Changer de numéro
            </button>
          </p>
          <Input
            label="Code à 4 chiffres"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            value={code}
            onValueChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 4))}
            autoFocus
            isRequired
          />
          {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
          <Button type="submit" color="primary" className="font-semibold" isLoading={chargement} isDisabled={code.length !== 4}>
            Valider
          </Button>
          <Button variant="light" isDisabled={attente > 0 || chargement} onPress={envoyerCode}>
            {attente > 0 ? `Renvoyer le code dans ${attente} s` : "Renvoyer le code"}
          </Button>
        </form>
      )}

      {etape === "profil" && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            enregistrerProfil();
          }}
        >
          <h2 className="text-xl font-bold">Bienvenue dans la Nation !</h2>
          <p className="text-sm text-gray-600">Comment vous appelez-vous ? Le restaurant et le livreur utiliseront ce nom.</p>
          <Input label="Prénom" autoComplete="given-name" value={prenom} onValueChange={setPrenom} isRequired maxLength={60} />
          <Input label="Nom" autoComplete="family-name" value={nom} onValueChange={setNom} isRequired maxLength={60} />
          {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
          <Button type="submit" color="primary" className="font-semibold" isLoading={chargement}>
            Continuer
          </Button>
        </form>
      )}
    </div>
  );
}
