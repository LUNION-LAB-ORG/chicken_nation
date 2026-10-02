"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { CheckCircle2, Phone } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { nomCourt } from "@/features/restaurants/restaurant.utils";
import { annulerCommandeAction, obtenirCommandeAction } from "../actions/commande.action";
import { useKkiapay } from "../hooks/useKkiapay";
import { restaurerPanierAtom } from "../stores/panier.store";
import type { IClient, ICommande, IConfigPaiement } from "../types/commande.types";
import { actionPerimee, messageErreurAction } from "../utils/erreur-action.utils";
import {
  ecrireMarquePaiement,
  effacerMarquePaiement,
  etatPaiement,
  type IMarquePaiement,
  lireMarquePaiement,
  lirePanierCommande,
  oublierPanierCommande,
} from "../utils/memoire-navigateur.utils";
import { fcfa, telephoneLisible } from "../utils/panier.utils";
import { aPayer, couleurStatut, estTerminee, etapesSuivi, libelleStatut } from "../utils/statut.utils";

/** Lien d'appel du restaurant de la commande, s'il a un numéro. */
function AppelRestaurant({ commande }: { commande: ICommande }) {
  if (!commande.restaurant?.phone) return null;
  const tel = commande.restaurant.phone;
  return (
    <a
      href={`tel:+225${tel.replace(/\D/g, "").replace(/^225/, "")}`}
      className="flex items-center justify-center gap-2 text-sm font-semibold text-primary"
    >
      <Phone size={16} /> Une question ? Appelez le restaurant au {telephoneLisible(tel)}
    </a>
  );
}

export default function SuiviCommande({
  id,
  client,
  ouvrirPaiement,
}: {
  id: string;
  client: IClient;
  ouvrirPaiement: boolean;
}) {
  const router = useRouter();
  const restaurerPanier = useSetAtom(restaurerPanierAtom);
  const [commande, setCommande] = useState<ICommande | null>(null);
  const [paiement, setPaiement] = useState<IConfigPaiement | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  // Relecture arrêtée : page à recharger (redéploiement, session expirée) ou
  // commande disparue. Relire ne changerait rien, on propose de recharger.
  const [arrete, setArrete] = useState(false);
  const [echec, setEchec] = useState(false);
  const [horloge, setHorloge] = useState(() => Date.now());
  // Tentative de paiement gardée dans le navigateur (cf. memoire-navigateur.utils).
  const [marque, setMarque] = useState<IMarquePaiement | null>(null);
  const [panierSauve, setPanierSauve] = useState(false);
  const [confirmerModif, setConfirmerModif] = useState(false);
  const [enModification, setEnModification] = useState(false);
  const [erreurModif, setErreurModif] = useState<string | null>(null);
  // Numéros des relectures : une réponse lente, dépassée par une plus récente,
  // est ignorée. Sinon une ancienne réponse « non payée » arrivée après la
  // réponse « payée » réaffichait le bouton « Payer » (marque déjà effacée).
  const lectures = useRef({ envoyees: 0, appliquee: 0 });

  /**
   * Relecture tolérante : une coupure réseau ou un redéploiement du site
   * (identifiants d'actions changés) ne figent plus le suivi en silence.
   */
  const relire = useCallback(async () => {
    const n = ++lectures.current.envoyees;
    try {
      const res = await obtenirCommandeAction(id);
      if (n < lectures.current.appliquee) return;
      lectures.current.appliquee = n;
      if (!res.ok) {
        setErreur(res.message);
        // Commande disparue ou session expirée : relire ne changera rien.
        if (res.statut === 404 || res.statut === 401) setArrete(true);
        return;
      }
      setErreur(null);
      setCommande(res.data.commande);
      setPaiement(res.data.paiement);
    } catch (e) {
      // Page périmée : toujours dit, la relecture s'arrête. Coupure passagère :
      // ignorée si une réponse plus récente est déjà affichée.
      if (actionPerimee(e)) setArrete(true);
      if (actionPerimee(e) || n >= lectures.current.appliquee) setErreur(messageErreurAction(e));
    } finally {
      // Même en cas d'échec : la confirmation (3 min) doit pouvoir passer à
      // la vérification, au lieu de « quelques secondes… » sans fin.
      setHorloge(Date.now());
    }
  }, [id]);

  /**
   * ?payer=1 retiré de l'adresse dès l'arrivée : un rechargement, un onglet
   * qu'Android recharge au retour de Mobile Money ou un retour arrière ne
   * rouvrent plus le module de paiement d'une commande peut-être déjà payée.
   */
  useEffect(() => {
    if (!ouvrirPaiement) return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("payer");
      // État `null` : Next recopie le sien et met à jour SA propre adresse ;
      // sans cela, il remettrait ?payer=1 à sa prochaine écriture.
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    } catch {
      /* adresse laissée telle quelle */
    }
  }, [ouvrirPaiement]);

  useEffect(() => {
    setPanierSauve(lirePanierCommande(id).length > 0);
  }, [id]);

  const reference = commande?.reference ?? null;
  const paye = !!commande?.paied;
  useEffect(() => {
    if (!reference) return;
    setMarque(lireMarquePaiement(reference));
  }, [reference]);

  // Payée : la tentative et le panier gardé ne servent plus.
  useEffect(() => {
    if (!paye || !reference) return;
    effacerMarquePaiement(reference);
    oublierPanierCommande(id);
    setMarque(null);
  }, [paye, reference, id]);

  const etat = commande && aPayer(commande) ? etatPaiement(marque, horloge) : "libre";
  const termine = !!commande && estTerminee(commande);
  // Relecture rapide les 3 premières minutes après le succès annoncé, puis lente.
  const rapide = etat === "confirmation";

  useEffect(() => {
    relire();
  }, [relire]);

  // Relecture régulière, seulement onglet visible, et tout de suite au retour.
  useEffect(() => {
    if (termine || arrete) return;
    const visible = () => document.visibilityState === "visible";
    const t = setInterval(() => {
      if (visible()) relire();
    }, rapide ? 4000 : 15000);
    const auRetour = () => {
      if (visible()) relire();
    };
    document.addEventListener("visibilitychange", auRetour);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", auRetour);
    };
  }, [relire, rapide, termine, arrete]);

  const { pret, ouvrir, erreurChargement, reessayer } = useKkiapay({
    onSucces: () => {
      setEchec(false);
      if (reference) {
        const m = { ...lireMarquePaiement(reference), succesA: Date.now() };
        ecrireMarquePaiement(reference, m);
        setMarque(m);
      }
      setHorloge(Date.now());
      relire();
    },
    onEchec: () => {
      setEchec(true);
      if (reference) effacerMarquePaiement(reference);
      setMarque(null);
      relire();
    },
  });

  const payer = useCallback(
    () => {
      if (!commande || !paiement || !aPayer(commande)) return;
      setEchec(false);
      const ouvert = ouvrir({
        amount: Math.ceil(commande.amount),
        key: paiement.public_key,
        sandbox: paiement.sandbox,
        phone: client.phone.replace(/^\+225/, ""),
        name: [client.first_name, client.last_name].filter(Boolean).join(" "),
        ...(client.email ? { email: client.email } : {}),
        reason: `Règlement Commande ${commande.reference}`,
        data: commande.reference,
      });
      if (!ouvert) return;
      const m = { ouvertA: Date.now() };
      ecrireMarquePaiement(commande.reference, m);
      setMarque(m);
    },
    [commande, paiement, client, ouvrir],
  );

  // Pas d'ouverture automatique du module de paiement : KKiaPay ignore un
  // appel fait avant d'avoir fini de se préparer, sans aucun moyen de le
  // savoir. La fenêtre restait vide, et la page croyait à tort qu'un paiement
  // avait commencé. Le client paie donc toujours par le bouton « Payer ».

  /**
   * « Modifier ma commande » : annule la commande non payée (le serveur rend
   * le bon d'achat ou le code engagé), remet ses plats dans le panier si cet
   * onglet les a gardés, et revient au panier.
   */
  const modifier = async () => {
    setErreurModif(null);
    setEnModification(true);
    try {
      const res = await annulerCommandeAction(id);
      if (!res.ok) {
        setEnModification(false);
        return setErreurModif(res.message);
      }
      const lignes = lirePanierCommande(id);
      if (lignes.length) restaurerPanier(lignes);
      oublierPanierCommande(id);
      if (reference) effacerMarquePaiement(reference);
      router.push("/commander");
    } catch (e) {
      setEnModification(false);
      setErreurModif(messageErreurAction(e));
    }
  };

  const recharger = () => window.location.assign(window.location.pathname);

  const bandeauErreur = erreur && (
    <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl bg-danger-50 p-4 text-sm text-danger">
      <span>{erreur}</span>
      {arrete && (
        <Button size="sm" color="primary" onPress={recharger}>
          Recharger
        </Button>
      )}
    </div>
  );

  if (!commande) {
    return (
      <div className="mx-auto flex max-w-2xl justify-center py-20">
        {erreur ? bandeauErreur : <Spinner color="primary" />}
      </div>
    );
  }

  const etapes = etapesSuivi(commande.type);
  const indexCourant = etapes.findIndex((e) => e.statuts.includes(commande.status));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {bandeauErreur}

      <div className="flex flex-col gap-2 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">Commande {commande.reference}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${couleurStatut(commande)}`}>
            {libelleStatut(commande)}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          {commande.type === "PICKUP" ? "À emporter" : "Livraison"}
          {commande.restaurant && ` · ${nomCourt(commande.restaurant.name)}`}
        </p>
        {commande.type !== "PICKUP" && commande.adresse && <p className="text-sm text-gray-600">{commande.adresse}</p>}
      </div>

      {aPayer(commande) && (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-primary bg-white p-5">
          {etat === "confirmation" ? (
            <div className="flex items-center gap-3">
              <Spinner size="sm" color="primary" />
              <p className="text-sm">Paiement reçu par KKiaPay. Confirmation en cours, cela prend quelques secondes…</p>
            </div>
          ) : etat === "verification" ? (
            <>
              <p className="font-semibold">Un paiement est peut-être en cours de vérification. Ne payez pas une seconde fois.</p>
              <p className="text-sm text-gray-600">
                Cette page se met à jour toute seule. En cas de doute, appelez le restaurant et donnez la référence{" "}
                <strong>{commande.reference}</strong>.
              </p>
              <AppelRestaurant commande={commande} />
            </>
          ) : (
            <>
              <p className="font-semibold">Votre commande sera envoyée au restaurant dès le paiement.</p>
              {etat === "commence" && (
                <p className="rounded-xl bg-warning-50 p-3 text-sm text-warning-700">
                  Un paiement a déjà été commencé pour cette commande. Si vous avez été débité, ne payez pas une seconde
                  fois : appelez le restaurant.
                </p>
              )}
              {echec && <p role="alert" className="text-sm text-danger">Le paiement n&apos;a pas abouti. Vous pouvez réessayer.</p>}
              {!paiement && <p className="text-sm text-danger">Le paiement en ligne est momentanément indisponible.</p>}
              {erreurChargement ? (
                <>
                  <p role="alert" className="text-sm text-danger">Le module de paiement n&apos;a pas pu se charger.</p>
                  <Button color="primary" size="lg" variant="bordered" className="font-semibold" onPress={reessayer}>
                    Réessayer
                  </Button>
                </>
              ) : (
                <Button
                  color="primary"
                  size="lg"
                  className="font-semibold"
                  isDisabled={!pret || !paiement || enModification}
                  onPress={() => payer()}
                >
                  {pret ? `Payer ${fcfa(Math.ceil(commande.amount))}` : "Chargement du paiement…"}
                </Button>
              )}
              {confirmerModif ? (
                <div className="flex flex-col gap-2 rounded-xl bg-gray-50 p-3 text-sm">
                  <p>
                    {panierSauve
                      ? "Cette commande sera annulée et ses plats remis dans votre panier."
                      : "Cette commande sera annulée. Vous pourrez refaire votre panier."}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" color="primary" isLoading={enModification} onPress={modifier}>
                      Oui, modifier
                    </Button>
                    <Button size="sm" variant="light" isDisabled={enModification} onPress={() => setConfirmerModif(false)}>
                      Non
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="text-sm font-semibold text-primary underline"
                  onClick={() => {
                    setErreurModif(null);
                    setConfirmerModif(true);
                  }}
                >
                  Modifier ma commande
                </button>
              )}
              {erreurModif && <p role="alert" className="text-sm text-danger">{erreurModif}</p>}
            </>
          )}
        </div>
      )}

      {commande.paied && commande.status !== "CANCELLED" && (
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 font-semibold text-success-600">
            <CheckCircle2 size={20} /> Paiement confirmé
          </p>
          {commande.recovery_code && (
            <p className="text-sm">
              Code de récupération : <strong className="text-lg tracking-widest">{commande.recovery_code}</strong>
              <span className="block text-gray-500">
                {commande.type === "PICKUP" ? "Donnez-le au comptoir." : "Donnez-le au livreur à la remise."}
              </span>
            </p>
          )}
          <ol className="flex flex-col gap-3">
            {etapes.map((e, i) => (
              <li key={e.libelle} className="flex items-center gap-3 text-sm">
                <span
                  className={`h-3 w-3 rounded-full ${i <= indexCourant ? "bg-primary" : "bg-gray-200"} ${i === indexCourant ? "ring-4 ring-primary/20" : ""}`}
                />
                <span className={i <= indexCourant ? "font-semibold" : "text-gray-500"}>{e.libelle}</span>
              </li>
            ))}
          </ol>
          {indexCourant < 0 && commande.status === "PENDING" && (
            <p className="text-sm text-gray-600">Le restaurant va confirmer votre commande dans un instant.</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold">Détail</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {commande.lignes.map((l, i) => {
            const details = [l.epice ? "Épicé" : null, ...l.options, ...l.supplements].filter(Boolean).join(" · ");
            return (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {l.quantite} × {l.nom}
                  {details && <span className="block text-xs text-gray-500">{details}</span>}
                </span>
                <span className="shrink-0">{fcfa(l.montant)}</span>
              </li>
            );
          })}
        </ul>
        <dl className="flex flex-col gap-1 border-t border-gray-100 pt-2 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{fcfa(commande.net_amount)}</dd>
          </div>
          {commande.discount > 0 && (
            <div className="flex justify-between text-success-600">
              <dt>Réduction</dt>
              <dd>− {fcfa(commande.discount)}</dd>
            </div>
          )}
          {commande.type !== "PICKUP" && (
            <div className="flex justify-between">
              <dt>Livraison</dt>
              <dd>{commande.delivery_fee === 0 ? "Offerte" : fcfa(commande.delivery_fee)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Frais de service</dt>
            <dd>{fcfa(commande.tax)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>Total</dt>
            <dd>{fcfa(commande.amount)}</dd>
          </div>
        </dl>
      </div>

      {etat !== "verification" && <AppelRestaurant commande={commande} />}
      <Link href="/commander/mes-commandes" className="text-center text-sm text-primary underline">
        Toutes mes commandes
      </Link>
    </div>
  );
}
