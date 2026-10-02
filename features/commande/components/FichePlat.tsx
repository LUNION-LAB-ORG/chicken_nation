"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSetAtom } from "jotai";
import { Minus, Plus } from "lucide-react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import { obtenirPlatAction } from "../actions/commande.action";
import { ajouterAuPanierAtom } from "../stores/panier.store";
import type { IOptionChoisie, IPlatDetail, ISupplementChoisi } from "../types/commande.types";
import {
  basculerOption,
  fcfa,
  groupeIncomplet,
  platDisponibleMaintenant,
  selectionParDefaut,
  signatureLigne,
  totalLigne,
} from "../utils/panier.utils";

const TITRES_SUPPLEMENTS: Record<string, string> = {
  FOOD: "Sauces",
  DRINK: "Boissons",
  ACCESSORY: "Accompagnements",
};

function Compteur({ valeur, onChange, min = 0, libelle }: { valeur: number; onChange: (v: number) => void; min?: number; libelle: string }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Retirer ${libelle}`}
        disabled={valeur <= min}
        onClick={() => onChange(valeur - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-primary text-primary disabled:opacity-30"
      >
        <Minus size={16} />
      </button>
      <span className="w-6 text-center font-semibold" aria-live="polite">{valeur}</span>
      <button
        type="button"
        aria-label={`Ajouter ${libelle}`}
        onClick={() => onChange(Math.min(valeur + 1, 20))}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

export default function FichePlat({ platId, onClose }: { platId: string | null; onClose: () => void }) {
  const ajouter = useSetAtom(ajouterAuPanierAtom);
  const [plat, setPlat] = useState<IPlatDetail | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [epice, setEpice] = useState(false);
  const [options, setOptions] = useState<IOptionChoisie[]>([]);
  const [supplements, setSupplements] = useState<Record<string, number>>({});
  const [quantite, setQuantite] = useState(1);

  useEffect(() => {
    if (!platId) return;
    let actif = true;
    setPlat(null);
    setErreur(null);
    setSupplements({});
    setQuantite(1);
    obtenirPlatAction(platId).then((res) => {
      if (!actif) return;
      if (!res.ok) return setErreur(res.message);
      setPlat(res.data);
      setEpice(res.data.spice_level === "ALWAYS");
      setOptions(selectionParDefaut(res.data.groupes));
    });
    return () => {
      actif = false;
    };
  }, [platId]);

  const supplementsChoisis: ISupplementChoisi[] = useMemo(
    () =>
      (plat?.supplements ?? [])
        .filter((s) => (supplements[s.id] ?? 0) > 0)
        .map((s) => ({ id: s.id, nom: s.name, prix: s.price, quantite: supplements[s.id] })),
    [plat, supplements],
  );

  const parCategorie = useMemo(() => {
    const groupes: Record<string, IPlatDetail["supplements"]> = {};
    for (const s of plat?.supplements ?? []) (groupes[s.category] ??= []).push(s);
    return groupes;
  }, [plat]);

  const disponible = plat ? platDisponibleMaintenant(plat.available_from, plat.available_until) : false;
  const incomplet = plat ? groupeIncomplet(plat.groupes, options) : null;
  const total = plat ? totalLigne({ prixUnitaire: plat.prix, options, supplements: supplementsChoisis, quantite }) : 0;

  const valider = () => {
    if (!plat || incomplet || !disponible) return;
    ajouter({
      cle: signatureLigne(plat.id, epice, options, supplementsChoisis),
      dish_id: plat.id,
      nom: plat.name,
      image: plat.image,
      prixUnitaire: plat.prix,
      epice,
      options,
      supplements: supplementsChoisis,
      quantite,
      available_order_types: plat.available_order_types,
    });
    addToast({ title: `${plat.name} ajouté au panier`, color: "success" });
    onClose();
  };

  return (
    <Modal isOpen={!!platId} onClose={onClose} size="lg" scrollBehavior="inside" placement="center">
      <ModalContent>
        {!plat ? (
          <ModalBody className="flex min-h-48 items-center justify-center">
            {erreur ? <p className="text-center text-gray-700">{erreur}</p> : <Spinner color="primary" />}
          </ModalBody>
        ) : (
          <>
            <ModalHeader className="flex flex-col gap-1 pr-10">
              <span className="text-xl font-bold uppercase">{plat.name}</span>
              <span className="text-primary">
                {plat.prixAvantPromo && <span className="mr-2 text-sm text-gray-500 line-through">{fcfa(plat.prixAvantPromo)}</span>}
                {fcfa(plat.prix)}
              </span>
            </ModalHeader>
            <ModalBody className="gap-5">
              <div className="relative mx-auto h-48 w-full">
                <Image src={plat.image} alt={plat.name} fill sizes="512px" className="object-contain" />
              </div>
              {plat.description && <p className="text-sm text-gray-600">{plat.description}</p>}
              {!disponible && (
                <p className="rounded-xl bg-warning-50 p-3 text-sm text-warning-700">
                  Ce plat est servi de {plat.available_from} à {plat.available_until}. Revenez à ce moment-là pour le commander.
                </p>
              )}

              {plat.spice_level === "OPTIONAL" && (
                <fieldset>
                  <legend className="mb-2 font-semibold">Épicé ?</legend>
                  <div className="flex gap-2">
                    {[false, true].map((v) => (
                      <button
                        key={String(v)}
                        type="button"
                        aria-pressed={epice === v}
                        onClick={() => setEpice(v)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium ${epice === v ? "border-primary bg-primary text-white" : "border-gray-300"}`}
                      >
                        {v ? "Épicé" : "Non épicé"}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {plat.groupes.map((g) => {
                const nb = options.filter((o) => o.group_id === g.id).length;
                return (
                  <fieldset key={g.id}>
                    <legend className="mb-2 font-semibold">
                      {g.name}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        {g.min_select > 0 ? "obligatoire, " : ""}
                        {g.max_select === 1 ? "1 choix" : `jusqu'à ${g.max_select} choix`}
                      </span>
                    </legend>
                    <div className="flex flex-col gap-2">
                      {g.items.map((i) => {
                        const choisi = options.some((o) => o.item_id === i.id);
                        return (
                          <button
                            key={i.id}
                            type="button"
                            role={g.max_select === 1 ? "radio" : "checkbox"}
                            aria-checked={choisi}
                            disabled={!i.available || (!choisi && g.max_select > 1 && nb >= g.max_select)}
                            onClick={() => setOptions((sel) => basculerOption(sel, g, i.id))}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm disabled:opacity-40 ${choisi ? "border-primary bg-primary/10" : "border-gray-200"}`}
                          >
                            <span>
                              {i.label}
                              {!i.available && " (indisponible)"}
                            </span>
                            {i.price_delta > 0 && <span className="text-gray-600">+ {fcfa(i.price_delta)}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}

              {Object.entries(parCategorie).map(([categorie, liste]) => (
                <fieldset key={categorie}>
                  <legend className="mb-2 font-semibold">
                    {TITRES_SUPPLEMENTS[categorie] ?? "Suppléments"} <span className="text-sm font-normal text-gray-500">en plus</span>
                  </legend>
                  <ul className="flex flex-col gap-2">
                    {liste.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                        <span>
                          {s.name} <span className="text-gray-500">+ {fcfa(s.price)}</span>
                        </span>
                        <Compteur
                          libelle={s.name}
                          valeur={supplements[s.id] ?? 0}
                          onChange={(v) => setSupplements((x) => ({ ...x, [s.id]: Math.max(0, v) }))}
                        />
                      </li>
                    ))}
                  </ul>
                </fieldset>
              ))}
            </ModalBody>
            <ModalFooter className="flex items-center justify-between gap-3">
              <Compteur libelle={plat.name} valeur={quantite} min={1} onChange={setQuantite} />
              <Button color="primary" className="font-semibold" isDisabled={!disponible || !!incomplet} onPress={valider}>
                {incomplet ? `Choisissez : ${incomplet.name}` : `Ajouter · ${fcfa(total)}`}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
