"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  calculerFraisAction,
  creerCommandeAction,
  lireFideliteAction,
  revaliderPanierAction,
  verifierCodeReductionAction,
} from "../actions/commande.action";
import { deconnexionAction } from "../actions/connexion.action";
import { changerQuantiteAtom, panierAtom, rafraichirPanierAtom, viderPanierAtom } from "../stores/panier.store";
import type {
  IAdresseLivraison,
  IClient,
  IFideliteClient,
  IFraisLivraison,
  ILivraisonDisponible,
  ModeCommande,
} from "../types/commande.types";
import { messageErreurAction } from "../utils/erreur-action.utils";
import {
  articlesAvecCadeaux,
  cadeauxNonProposes,
  pointsGagnes,
  pointsLisibles,
  pointsRetenus,
  pointsUtilisables,
  problemesCadeau,
  remisePoints,
} from "../utils/fidelite.utils";
import { noterEcartPoints, sauverPanierCommande } from "../utils/memoire-navigateur.utils";
import {
  articlesPayants,
  fcfa,
  lignesACommander,
  platsNonProposes,
  problemesLigne,
  sousTotal,
  telephoneLisible,
  totalLigne,
} from "../utils/panier.utils";
import { creneauxRetrait, heureLisible, plageOuverte } from "../utils/retrait.utils";
import AdresseLivraison from "./AdresseLivraison";
import Connexion from "./Connexion";
import MesCadeaux from "./MesCadeaux";
import MesPoints from "./MesPoints";

function Bloc({ titre, action, children }: { titre: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{titre}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Panier({
  clientInitial,
  restaurants,
  livraison,
}: {
  clientInitial: IClient | null;
  restaurants: IRestaurantPublic[];
  /** Livraison coupée depuis le back office : on part sur « À emporter ». */
  livraison: ILivraisonDisponible;
}) {
  const router = useRouter();
  const lignes = useAtomValue(panierAtom);
  const changerQuantite = useSetAtom(changerQuantiteAtom);
  const vider = useSetAtom(viderPanierAtom);
  const rafraichir = useSetAtom(rafraichirPanierAtom);

  // Le panier vit dans le navigateur : on attend d'être monté pour l'afficher.
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);

  const [client, setClient] = useState(clientInitial);
  const [mode, setMode] = useState<ModeCommande>(livraison.disponible ? "DELIVERY" : "PICKUP");
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
  // Commande créée, panier vidé : on attend la page de paiement.
  const [redirection, setRedirection] = useState(false);
  const [confirmerVider, setConfirmerVider] = useState(false);
  const [revalidation, setRevalidation] = useState(false);
  const [prixMisAJour, setPrixMisAJour] = useState(false);
  // Fidélité du client connecté : points et cadeaux (cf. lireFideliteAction).
  const [fidelite, setFidelite] = useState<IFideliteClient | null>(null);
  const [erreurFidelite, setErreurFidelite] = useState<string | null>(null);
  const [essaiFidelite, setEssaiFidelite] = useState(0);
  const [pointsChoisis, setPointsChoisis] = useState(0);
  const [cadeauxChoisis, setCadeauxChoisis] = useState<string[]>([]);
  // Phrase de non-cumul (RG-02), affichée dans le bloc où le client a agi.
  const [avisCumul, setAvisCumul] = useState<{ ou: "points" | "code"; texte: string } | null>(null);

  /**
   * Connecté mais sans prénom ou nom (code validé, puis page quittée avant
   * l'étape du nom) : la connexion n'est pas finie. La commande partait sinon
   * au nom de « null null », vu par la caisse, le livreur et Turbo.
   */
  const profilComplet = !!client?.first_name && !!client?.last_name;

  /**
   * Points et cadeaux lus une fois la connexion finie, et relus si le client
   * change. Un échec ne bloque pas la commande : elle reste possible sans eux.
   */
  const clientId = profilComplet ? (client?.id ?? null) : null;
  // Autre client, ou déconnexion : rien du précédent ne doit rester.
  useEffect(() => {
    setFidelite(null);
    setPointsChoisis(0);
    setCadeauxChoisis([]);
  }, [clientId]);
  // Relecture (« Recharger », commande refusée) : la lecture précédente reste
  // affichée jusqu'à la nouvelle. Un échec réseau ne retire donc pas en
  // silence les points choisis de la commande.
  useEffect(() => {
    setErreurFidelite(null);
    if (!clientId) return;
    let actif = true;
    lireFideliteAction()
      .then((res) => {
        if (!actif) return;
        if (!res.ok) return setErreurFidelite(res.message);
        setFidelite(res.data);
        // Un cadeau qui n'est plus proposé est oublié : rendu plus tard, il
        // ne doit pas revenir déjà choisi.
        setCadeauxChoisis((avant) => avant.filter((id) => res.data.cadeaux.some((c) => c.id === id)));
      })
      .catch((e) => {
        if (actif) setErreurFidelite(messageErreurAction(e));
      });
    return () => {
      actif = false;
    };
  }, [clientId, essaiFidelite]);

  /**
   * Panier relu au catalogue à l'ouverture : il peut dater de plusieurs jours.
   * Un plat retiré est marqué et écarté ; prix, modes, créneaux et restaurants
   * sont remis à jour. Si la relecture échoue, le panier reste tel quel : le
   * serveur revérifie tout à la création de la commande.
   */
  const revalide = useRef(false);
  useEffect(() => {
    if (!monte || revalide.current) return;
    revalide.current = true;
    const ids = lignes.map((l) => l.dish_id);
    if (ids.length === 0) return;
    setRevalidation(true);
    revaliderPanierAction(ids)
      .then((plats) => setPrixMisAJour(rafraichir(plats)))
      .catch(() => {
        /* relecture impossible : panier gardé tel quel */
      })
      .finally(() => setRevalidation(false));
  }, [monte, lignes, rafraichir]);

  const aCommander = lignesACommander(lignes);
  const total = sousTotal(lignes);
  // Cadeaux choisis encore proposés (un cadeau utilisé ailleurs a quitté la liste).
  const cadeaux = useMemo(() => fidelite?.cadeaux ?? [], [fidelite]);
  const cadeauxRetenus = useMemo(() => cadeaux.filter((c) => cadeauxChoisis.includes(c.id)), [cadeaux, cadeauxChoisis]);

  // Frais recalculés à chaque changement d'adresse ou de montant (les offres de
  // livraison dépendent du montant du panier).
  const lat = adresse?.latitude;
  const lng = adresse?.longitude;
  useEffect(() => {
    if (mode !== "DELIVERY" || lat === undefined || lng === undefined) {
      setFrais(null);
      setErreurFrais(null);
      setCalculFrais(false);
      return;
    }
    let actif = true;
    setCalculFrais(true);
    calculerFraisAction(lat, lng, total)
      .then((res) => {
        if (!actif) return;
        if (res.ok) {
          setFrais(res.data);
          setErreurFrais(null);
        } else {
          setFrais(null);
          setErreurFrais(res.message);
        }
      })
      .catch((e) => {
        if (!actif) return;
        setFrais(null);
        setErreurFrais(messageErreurAction(e));
      })
      .finally(() => {
        if (actif) setCalculFrais(false);
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
        .map((r) => ({
          r,
          ouvert: !!plageOuverte(r.schedule, maintenant),
          creneaux: creneauxRetrait(r.schedule, maintenant),
          // Plats du panier, cadeaux compris, que ce restaurant ne propose pas : le serveur refuserait.
          absents: [...platsNonProposes(lignes, r.id), ...cadeauxNonProposes(cadeauxRetenus, r.id)],
        }))
        .sort((a, b) => Number(b.ouvert && !b.absents.length) - Number(a.ouvert && !a.absents.length)),
    [restaurants, maintenant, lignes, cadeauxRetenus],
  );
  const retraitChoisi = restaurantsRetrait.find((x) => x.r.id === restaurantId) ?? null;

  // Heure lue à chaque affichage : un plat peut sortir de son créneau pendant
  // que le client remplit le formulaire.
  const problemes = new Map(aCommander.map((l) => [l.cle, problemesLigne(l, mode, new Date())]));
  const lignesBloquees = aCommander.filter((l) => (problemes.get(l.cle) ?? []).length > 0);

  // Points : jamais avec un code (RG-02), ramenés au maximum de ce panier.
  const f = fidelite?.points ?? null;
  const retenus = reduction ? 0 : pointsRetenus(pointsChoisis, f, total);
  const remiseDesPoints = remisePoints(retenus, f, total);
  const remise = reduction?.remise ?? remiseDesPoints;
  const gagnes = f ? pointsGagnes(total, f.pointsParFranc) : 0;

  // Cadeaux : mêmes contrôles que le serveur sur l'article offert, et place
  // des suppléments offerts sur les plats payants.
  const { nonPlaces } = articlesAvecCadeaux(articlesPayants(lignes), cadeauxRetenus);
  const problemesCadeaux = new Map(
    cadeaux.map((c) => [
      c.id,
      [
        ...problemesCadeau(c, mode, new Date()),
        ...(nonPlaces.some((n) => n.id === c.id)
          ? ["Chaque plat du panier a déjà ce supplément. Ajoutez un plat ou retirez ce cadeau."]
          : []),
      ],
    ]),
  );
  const cadeauxBloques = cadeauxRetenus.filter((c) => (problemesCadeaux.get(c.id) ?? []).length > 0);

  const fraisLivraison = mode === "DELIVERY" ? (frais?.montant ?? 0) : 0;
  const estimation = Math.max(0, total - remise) + fraisLivraison;

  const pret =
    profilComplet &&
    !revalidation &&
    aCommander.length > 0 &&
    lignesBloquees.length === 0 &&
    cadeauxBloques.length === 0 &&
    (mode === "DELIVERY"
      ? livraison.disponible && !!adresse && !!frais && !calculFrais
      : !!retraitChoisi?.ouvert && retraitChoisi.absents.length === 0);

  const appliquerCode = async () => {
    setErreurCode(null);
    setVerifCode(true);
    try {
      const res = await verifierCodeReductionAction(saisieCode, lignes, total);
      if (!res.ok) return setErreurCode(res.message);
      setReduction(res.data);
      // RG-02 : le code remplace les points. Choix oublié même s'il ne
      // comptait plus (panier diminué) : retirer le code ne doit pas le
      // remettre sans que le client l'ait redemandé.
      setPointsChoisis(0);
      if (retenus > 0) {
        setAvisCumul({ ou: "code", texte: "Vos points ont été retirés : points et code ne se cumulent pas." });
      } else setAvisCumul(null);
    } catch (e) {
      setErreurCode(messageErreurAction(e));
    } finally {
      setVerifCode(false);
    }
  };

  // RG-02 : les points remplacent le code.
  const utiliserPoints = (n: number) => {
    setPointsChoisis(n);
    if (reduction) {
      setAvisCumul({ ou: "points", texte: `Le code ${reduction.code} a été retiré : points et code ne se cumulent pas.` });
      setReduction(null);
    } else setAvisCumul(null);
  };

  const basculerCadeau = (id: string) =>
    setCadeauxChoisis((avant) => (avant.includes(id) ? avant.filter((x) => x !== id) : [...avant, id]));

  const commander = async () => {
    if (!pret) return;
    setErreur(null);
    setEnvoi(true);
    try {
      const res = await creerCommandeAction({
        mode,
        lignes,
        adresse: mode === "DELIVERY" ? adresse : null,
        restaurantId: mode === "PICKUP" ? restaurantId : null,
        heureRetrait: mode === "PICKUP" && heure !== "asap" ? heure : null,
        code: reduction?.code ?? null,
        points: retenus,
        cadeaux: cadeauxRetenus.map(({ id, type, articleId, nom }) => ({ id, type, articleId, nom })),
      });
      if (!res.ok) {
        setEnvoi(false);
        // Cadeau utilisé depuis l'application, solde ou réglages changés :
        // relus, pour que le panier montre l'état du jour (un cadeau qui n'est
        // plus proposé quitte aussi la sélection).
        if (retenus > 0 || cadeauxRetenus.length > 0) setEssaiFidelite((n) => n + 1);
        return setErreur(res.message);
      }
      // Remise des points plus faible que l'estimation : la page de paiement le dira.
      if (retenus > 0 && res.data.remise < remiseDesPoints) {
        noterEcartPoints(res.data.id, { estimee: remiseDesPoints, accordee: res.data.remise });
      }
      // Gardé le temps de l'onglet : « Modifier ma commande » le remettra.
      // Les cadeaux n'y sont pas : le serveur les rend à l'annulation, le
      // client les choisit de nouveau.
      sauverPanierCommande(res.data.id, aCommander);
      setRedirection(true);
      vider();
      router.push(`/commander/${res.data.id}?payer=1`);
    } catch (e) {
      setEnvoi(false);
      setErreur(messageErreurAction(e));
    }
  };

  const seDeconnecter = async () => {
    setErreur(null);
    try {
      await deconnexionAction();
      setClient(null);
      router.refresh();
    } catch (e) {
      setErreur(messageErreurAction(e));
    }
  };

  if (!monte || redirection) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <Spinner color="primary" />
        {redirection && <p className="text-sm text-gray-600">Ouverture du paiement…</p>}
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
        <Bloc
          titre="Votre panier"
          action={
            confirmerVider ? (
              <span className="flex items-center gap-3 text-sm">
                Vider le panier ?
                <button
                  type="button"
                  className="font-semibold text-danger underline"
                  onClick={() => {
                    vider();
                    setConfirmerVider(false);
                  }}
                >
                  Oui
                </button>
                <button type="button" className="font-semibold underline" onClick={() => setConfirmerVider(false)}>
                  Non
                </button>
              </span>
            ) : (
              <button type="button" className="text-sm text-gray-600 underline" onClick={() => setConfirmerVider(true)}>
                Vider le panier
              </button>
            )
          }
        >
          {revalidation && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner size="sm" color="primary" /> Vérification des plats du panier…
            </div>
          )}
          {prixMisAJour && (
            <p className="rounded-xl bg-warning-50 p-3 text-sm text-warning-700">
              Des prix ont changé depuis votre dernier passage : le panier affiche les prix du jour.
            </p>
          )}
          <ul className="flex flex-col divide-y divide-gray-100">
            {lignes.map((l) => (
              <li key={l.cle} className={`flex gap-3 py-3 ${l.retire ? "opacity-60" : ""}`}>
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
                  {l.retire ? (
                    <p className="text-xs text-danger">Ce plat n&apos;est plus proposé. Il ne sera pas commandé.</p>
                  ) : (
                    (problemes.get(l.cle) ?? []).map((p) => (
                      <p key={p} className="text-xs text-danger">
                        {p}
                      </p>
                    ))
                  )}
                  <div className="flex items-center justify-between">
                    {l.retire ? (
                      <button
                        type="button"
                        onClick={() => changerQuantite({ cle: l.cle, quantite: 0 })}
                        className="flex items-center gap-1 text-sm font-semibold text-primary underline"
                      >
                        <Trash2 size={14} /> Retirer
                      </button>
                    ) : (
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
                    )}
                    {!l.retire && <span className="font-semibold">{fcfa(totalLigne(l))}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {aCommander.length === 0 && (
            <p className="text-sm text-danger">Aucun plat de ce panier n&apos;est encore proposé. Ajoutez d&apos;autres plats.</p>
          )}
          <Link href="/restaurants/nos-menus" className="text-sm font-semibold text-primary">
            + Ajouter d&apos;autres plats
          </Link>
        </Bloc>

        {!profilComplet ? (
          <Connexion
            etapeInitiale={client ? "profil" : "telephone"}
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
                    disabled={m.valeur === "DELIVERY" && !livraison.disponible}
                    onClick={() => setMode(m.valeur)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-4 font-semibold disabled:opacity-50 ${mode === m.valeur ? "border-primary bg-primary/10 text-primary" : "border-gray-200"}`}
                  >
                    {m.icone}
                    {m.libelle}
                  </button>
                ))}
              </div>
              {!livraison.disponible && livraison.message && (
                <p role="status" className="rounded-xl bg-warning-50 p-3 text-sm text-warning-700">
                  {livraison.message}
                </p>
              )}

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
                    {restaurantsRetrait.map(({ r, ouvert, absents }) => (
                      <button
                        key={r.id}
                        type="button"
                        role="radio"
                        aria-checked={restaurantId === r.id}
                        disabled={!ouvert || absents.length > 0}
                        onClick={() => {
                          setRestaurantId(r.id);
                          setHeure("asap");
                        }}
                        className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left disabled:opacity-50 ${restaurantId === r.id ? "border-primary bg-primary/10" : "border-gray-200"}`}
                      >
                        <span>
                          <span className="block font-semibold">{nomCourt(r.name)}</span>
                          {r.address && <span className="block text-xs text-gray-500">{r.address.replace(/,\s*Côte d['’]Ivoire$/i, "")}</span>}
                          {absents.length > 0 && (
                            <span className="block text-xs text-danger">Ne propose pas : {absents.join(", ")}</span>
                          )}
                        </span>
                        <span className={`shrink-0 text-xs font-semibold ${ouvert ? "text-success-600" : "text-gray-500"}`}>
                          {ouvert ? "Ouvert" : "Fermé"}
                        </span>
                      </button>
                    ))}
                  </div>
                  {retraitChoisi?.ouvert && retraitChoisi.absents.length === 0 && (
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
              {avisCumul?.ou === "code" && <p role="status" className="text-sm text-warning-700">{avisCumul.texte}</p>}
            </Bloc>

            {f && pointsUtilisables(f, total) && (
              <Bloc titre="Mes points">
                <MesPoints
                  points={f}
                  sousTotal={total}
                  retenus={retenus}
                  remise={remiseDesPoints}
                  avis={avisCumul?.ou === "points" ? avisCumul.texte : null}
                  onUtiliser={utiliserPoints}
                  onRetirer={() => {
                    setPointsChoisis(0);
                    setAvisCumul(null);
                  }}
                />
              </Bloc>
            )}

            {cadeaux.length > 0 && (
              <Bloc titre="Mes cadeaux">
                <MesCadeaux
                  cadeaux={cadeaux}
                  choisis={cadeauxChoisis}
                  problemes={problemesCadeaux}
                  actif={aCommander.length > 0}
                  onBasculer={basculerCadeau}
                />
              </Bloc>
            )}

            {erreurFidelite && (
              <p role="alert" className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                Points et cadeaux : {erreurFidelite}
                <button
                  type="button"
                  className="font-semibold text-primary underline"
                  onClick={() => setEssaiFidelite((n) => n + 1)}
                >
                  Recharger
                </button>
              </p>
            )}
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
              <dt>{retenus > 0 ? "Points de fidélité (estimation)" : "Réduction"}</dt>
              <dd>− {fcfa(remise)}</dd>
            </div>
          )}
          {cadeauxRetenus.map((c) => (
            <div key={c.id} className="flex justify-between gap-3 text-success-600">
              <dt className="min-w-0">Cadeau : {c.nom}</dt>
              <dd className="shrink-0">Offert</dd>
            </div>
          ))}
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
        {profilComplet && gagnes > 0 && (
          <p className="text-xs text-success-600">
            Vous gagnerez environ {pointsLisibles(gagnes)}, crédité{gagnes >= 2 ? "s" : ""} une fois le paiement validé.
          </p>
        )}
        {client && profilComplet && (
          <p className="text-xs text-gray-500">
            Commande au nom de {client.first_name} {client.last_name}, {telephoneLisible(client.phone)}.{" "}
            <button type="button" className="underline" onClick={seDeconnecter}>
              Ce n&apos;est pas vous ?
            </button>
          </p>
        )}
        {erreur && <p role="alert" className="text-sm text-danger">{erreur}</p>}
        <Button color="primary" size="lg" className="font-semibold" isDisabled={!pret} isLoading={envoi} onPress={commander}>
          Valider la commande
        </Button>
        {!profilComplet && <p className="text-center text-xs text-gray-500">Connectez-vous pour valider la commande.</p>}
        <p className="text-center text-xs text-gray-500">Paiement sécurisé par KKiaPay.</p>
      </aside>
    </div>
  );
}
