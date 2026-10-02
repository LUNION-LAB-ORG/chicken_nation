"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAtomValue, useSetAtom } from "jotai";
import { Bike, Minus, Plus, Store, Trash2 } from "lucide-react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { Link, useRouter } from "@/i18n/navigation";
import type { IRestaurantPublic } from "@/features/restaurants/restaurant.type";
import { nomCourt } from "@/features/restaurants/restaurant.utils";
import { calculerFraisAction, creerCommandeAction, verifierCodeReductionAction } from "../actions/commande.action";
import { deconnexionAction } from "../actions/connexion.action";
import { changerQuantiteAtom, panierAtom, viderPanierAtom } from "../stores/panier.store";
import type { IAdresseLivraison, IClient, IFraisLivraison, ModeCommande } from "../types/commande.types";
import { fcfa, sousTotal, telephoneLisible, totalLigne } from "../utils/panier.utils";
import { creneauxRetrait, heureLisible, plageOuverte } from "../utils/retrait.utils";
import AdresseLivraison from "./AdresseLivraison";
import Connexion from "./Connexion";

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">{titre}</h2>
      {children}
    </section>
  );
}

export default function Panier({
  clientInitial,
  restaurants,
}: {
  clientInitial: IClient | null;
  restaurants: IRestaurantPublic[];
}) {
  const router = useRouter();
  const lignes = useAtomValue(panierAtom);
  const changerQuantite = useSetAtom(changerQuantiteAtom);
  const vider = useSetAtom(viderPanierAtom);

  // Le panier vit dans le navigateur : on attend d'être monté pour l'afficher.
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);

  const [client, setClient] = useState(clientInitial);
  const [mode, setMode] = useState<ModeCommande>("DELIVERY");
  const [adresse, setAdresse] = useState<IAdresseLivraison | null>(null);
  const [frais, setFrais] = useState<IFraisLivraison | null>(null);
  const [erreurFrais, setErreurFrais] = useState<string | null>(null);
  const [calculFrais, setCalculFrais] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [heure, setHeure] = useState<string>("asap");
  const [saisieCode, setSaisieCode] = useState("");
  const [reduction, setReduction] = useState<{ code: string; remise: number } | null>(null);
  const [erreurCode, setErreurCode] = useState<string | null>(null);
  const [verifCode, setVerifCode] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const total = sousTotal(lignes);

  // Frais recalculés à chaque changement d'adresse ou de montant (les offres de
  // livraison dépendent du montant du panier).
  const lat = adresse?.latitude;
  const lng = adresse?.longitude;
  useEffect(() => {
    if (mode !== "DELIVERY" || lat === undefined || lng === undefined) {
      setFrais(null);
      setErreurFrais(null);
      return;
    }
    let actif = true;
    setCalculFrais(true);
    calculerFraisAction(lat, lng, total).then((res) => {
      if (!actif) return;
      setCalculFrais(false);
      if (res.ok) {
        setFrais(res.data);
        setErreurFrais(null);
      } else {
        setFrais(null);
        setErreurFrais(res.message);
      }
    });
    return () => {
      actif = false;
    };
  }, [mode, lat, lng, total]);

  // Un code vérifié pour un autre panier n'est plus garanti : on le revérifie.
  useEffect(() => setReduction(null), [total]);

  const maintenant = useMemo(() => new Date(), [monte]); // eslint-disable-line react-hooks/exhaustive-deps
  const restaurantsRetrait = useMemo(
    () =>
      restaurants
        .map((r) => ({ r, ouvert: !!plageOuverte(r.schedule, maintenant), creneaux: creneauxRetrait(r.schedule, maintenant) }))
        .sort((a, b) => Number(b.ouvert) - Number(a.ouvert)),
    [restaurants, maintenant],
  );
  const retraitChoisi = restaurantsRetrait.find((x) => x.r.id === restaurantId) ?? null;

  const nonDisponibles = lignes.filter((l) => !l.available_order_types.includes(mode));
  const remise = reduction?.remise ?? 0;
  const fraisLivraison = mode === "DELIVERY" ? (frais?.montant ?? 0) : 0;
  const estimation = Math.max(0, total - remise) + fraisLivraison;

  const pret =
    !!client &&
    lignes.length > 0 &&
    nonDisponibles.length === 0 &&
    (mode === "DELIVERY" ? !!adresse && !!frais && !calculFrais : !!retraitChoisi?.ouvert);

  const appliquerCode = async () => {
    setErreurCode(null);
    setVerifCode(true);
    const res = await verifierCodeReductionAction(saisieCode, lignes, total);
    setVerifCode(false);
    if (!res.ok) return setErreurCode(res.message);
    setReduction(res.data);
  };

  const commander = async () => {
    if (!client || !pret) return;
    setErreur(null);
    setEnvoi(true);
    const res = await creerCommandeAction({
      mode,
      lignes,
      adresse: mode === "DELIVERY" ? adresse : null,
      restaurantId: mode === "PICKUP" ? restaurantId : null,
      heureRetrait: mode === "PICKUP" && heure !== "asap" ? heure : null,
      code: reduction?.code ?? null,
      nomComplet: [client.first_name, client.last_name].filter(Boolean).join(" "),
      telephone: client.phone,
      email: client.email,
    });
    if (!res.ok) {
      setEnvoi(false);
      return setErreur(res.message);
    }
    vider();
    router.push(`/commander/${res.data.id}?payer=1`);
  };

  if (!monte) {
    return (
      <div className="flex justify-center py-20">
        <Spinner color="primary" />
      </div>
    );
  }

  if (lignes.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <p className="text-lg font-semibold">Votre panier est vide.</p>
        <Button as={Link} href="/restaurants/nos-menus" color="primary" className="font-semibold">
          Voir le menu
        </Button>
        <Link href="/commander/mes-commandes" className="text-sm text-primary underline">
          Mes commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <Bloc titre="Votre panier">
          <ul className="flex flex-col divide-y divide-gray-100">
            {lignes.map((l) => (
              <li key={l.cle} className="flex gap-3 py-3">
                <div className="relative h-16 w-16 shrink-0">
                  <Image src={l.image} alt="" fill sizes="64px" className="rounded-xl object-contain" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="font-semibold uppercase">{l.nom}</p>
                  <p className="text-xs text-gray-500">
                    {[
                      l.epice ? "Épicé" : null,
                      ...l.options.map((o) => o.label),
                      ...l.supplements.map((s) => `${s.quantite} × ${s.nom}`),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {!l.available_order_types.includes(mode) && (
                    <p className="text-xs text-danger">Indisponible en {mode === "DELIVERY" ? "livraison" : "retrait"}.</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={l.quantite === 1 ? `Retirer ${l.nom}` : `Diminuer la quantité de ${l.nom}`}
                        onClick={() => changerQuantite({ cle: l.cle, quantite: l.quantite - 1 })}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300"
                      >
                        {l.quantite === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">{l.quantite}</span>
                      <button
                        type="button"
                        aria-label={`Augmenter la quantité de ${l.nom}`}
                        onClick={() => changerQuantite({ cle: l.cle, quantite: Math.min(l.quantite + 1, 20) })}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-semibold">{fcfa(totalLigne(l))}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/restaurants/nos-menus" className="text-sm font-semibold text-primary">
            + Ajouter d&apos;autres plats
          </Link>
        </Bloc>

        {!client ? (
          <Connexion
            onConnecte={(c) => {
              setClient(c);
              router.refresh();
            }}
          />
        ) : (
          <>
            <Bloc titre="Livraison ou retrait ?">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { valeur: "DELIVERY", libelle: "Livraison", icone: <Bike size={22} /> },
                    { valeur: "PICKUP", libelle: "À emporter", icone: <Store size={22} /> },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.valeur}
                    type="button"
                    aria-pressed={mode === m.valeur}
                    onClick={() => setMode(m.valeur)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 font-semibold ${mode === m.valeur ? "border-primary bg-primary/10 text-primary" : "border-gray-200"}`}
                  >
                    {m.icone}
                    {m.libelle}
                  </button>
                ))}
              </div>

              {mode === "DELIVERY" ? (
                <>
                  <AdresseLivraison adresse={adresse} onChange={setAdresse} />
                  {calculFrais && <p className="text-sm text-gray-500">Calcul des frais de livraison…</p>}
                  {erreurFrais && <p role="alert" className="text-sm text-danger">{erreurFrais}</p>}
                  {frais && !calculFrais && (
                    <p className="text-sm text-gray-700">
                      Livraison : <strong>{frais.montant === 0 ? "offerte" : fcfa(frais.montant)}</strong>
                      {frais.montantAvantOffre && <span className="ml-2 text-gray-500 line-through">{fcfa(frais.montantAvantOffre)}</span>}
                      {frais.offre && <span className="ml-2 text-success-600">{frais.offre}</span>}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2" role="radiogroup" aria-label="Restaurant de retrait">
                    {restaurantsRetrait.map(({ r, ouvert }) => (
                      <button
                        key={r.id}
                        type="button"
                        role="radio"
                        aria-checked={restaurantId === r.id}
                        disabled={!ouvert}
                        onClick={() => {
                          setRestaurantId(r.id);
                          setHeure("asap");
                        }}
                        className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left disabled:opacity-50 ${restaurantId === r.id ? "border-primary bg-primary/10" : "border-gray-200"}`}
                      >
                        <span>
                          <span className="block font-semibold">{nomCourt(r.name)}</span>
                          {r.address && <span className="block text-xs text-gray-500">{r.address.replace(/,\s*Côte d['’]Ivoire$/i, "")}</span>}
                        </span>
                        <span className={`text-xs font-semibold ${ouvert ? "text-success-600" : "text-gray-500"}`}>
                          {ouvert ? "Ouvert" : "Fermé"}
                        </span>
                      </button>
                    ))}
                  </div>
                  {retraitChoisi?.ouvert && (
                    <Select
                      label="Heure de retrait"
                      selectedKeys={[heure]}
                      onSelectionChange={(k) => setHeure(String(Array.from(k)[0] ?? "asap"))}
                    >
                      {[
                        <SelectItem key="asap">Dès que possible</SelectItem>,
                        ...retraitChoisi.creneaux.map((d) => <SelectItem key={d.toISOString()}>{heureLisible(d)}</SelectItem>),
                      ]}
                    </Select>
                  )}
                </div>
              )}
            </Bloc>

            <Bloc titre="Code promo ou bon d'achat">
              {reduction ? (
                <div className="flex items-center justify-between rounded-xl bg-success-50 p-3 text-sm">
                  <span>
                    <strong>{reduction.code}</strong> : − {fcfa(reduction.remise)}
                  </span>
                  <button type="button" className="font-semibold text-primary underline" onClick={() => setReduction(null)}>
                    Retirer
                  </button>
                </div>
              ) : (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    appliquerCode();
                  }}
                >
                  <Input
                    aria-label="Code promo ou bon d'achat"
                    placeholder="Votre code"
                    value={saisieCode}
                    onValueChange={(v) => setSaisieCode(v.toUpperCase())}
                    autoCapitalize="characters"
                  />
                  <Button type="submit" variant="bordered" isLoading={verifCode} isDisabled={saisieCode.trim().length < 3}>
                    Appliquer
                  </Button>
                </form>
              )}
              {erreurCode && <p role="alert" className="text-sm text-danger">{erreurCode}</p>}
            </Bloc>
          </>
        )}
      </div>

      <aside className="flex h-fit flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-lg font-bold">Récapitulatif</h2>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{fcfa(total)}</dd>
          </div>
          {remise > 0 && (
            <div className="flex justify-between text-success-600">
              <dt>Réduction</dt>
              <dd>− {fcfa(remise)}</dd>
            </div>
          )}
          {mode === "DELIVERY" && (
            <div className="flex justify-between">
              <dt>Livraison</dt>
              <dd>{frais ? (frais.montant === 0 ? "Offerte" : fcfa(frais.montant)) : "selon l'adresse"}</dd>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <dt>Frais de service</dt>
            <dd>calculés à l&apos;étape suivante</dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold">
            <dt>Total estimé</dt>
            <dd>{fcfa(estimation)}</dd>
          </div>
        </dl>
        {client && (
          <p className="text-xs text-gray-500">
            Commande au nom de {[client.first_name, client.last_name].filter(Boolean).join(" ")}, {telephoneLisible(client.phone)}.{" "}
            <button
              type="button"
              className="underline"
              onClick={async () => {
                await deconnexionAction();
                setClient(null);
                router.refresh();
              }}
            >
              Ce n&apos;est pas vous ?
            </button>
          </p>
        )}
        {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
        <Button color="primary" size="lg" className="font-semibold" isDisabled={!pret} isLoading={envoi} onPress={commander}>
          Valider et payer
        </Button>
        {!client && <p className="text-center text-xs text-gray-500">Connectez-vous pour valider la commande.</p>}
        <p className="text-center text-xs text-gray-500">Paiement sécurisé par KKiaPay.</p>
      </aside>
    </div>
  );
}
