"use client";

import type {
  ICadeau,
  IClient,
  IConditionsCommande,
  ICreationCommande,
  IFideliteClient,
  IFraisLivraison,
  ILignePanier,
  ILivraisonDisponible,
  IReglagesFidelite,
  ModeCommande,
  NiveauEpice,
} from "../../types/commande.types";
import type { EtapeCaisse, IEtatCaisse } from "../../utils/caisse.utils";
import type { IRetraitVue } from "./EtapeLivraisonRetrait";
import type { ILigneResume } from "./EtapePaiement";
import type { IRecapCaisse } from "./Recapitulatif";
import type { IRestaurantSite } from "@/features/restaurants/restaurants.site";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import {
  calculerFraisAction,
  itineraireLivraisonAction,
  lireFideliteAction,
  obtenirCommandeAction,
  obtenirPlatAction,
  revaliderPanierAction,
  verifierCodeReductionAction,
} from "../../actions/commande.action";
import { deconnexionAction } from "../../actions/connexion.action";
import {
  adresseAtom,
  allerEtapeAtom,
  avantagesAtom,
  etapeAtom,
  etapeVueAtom,
  heureRetraitAtom,
  modeAtom,
  oublierAvantagesAtom,
  restaurantIdAtom,
} from "../../stores/caisse.store";
import {
  ficheBrancheeAtom,
  ficheDemandeeAtom,
} from "../../stores/interface.store";
import {
  changerQuantiteAtom,
  panierAtom,
  rafraichirPanierAtom,
  retirerHorsModeAtom,
  viderPanierAtom,
} from "../../stores/panier.store";
import {
  etapeAccessible,
  etapeMaximale,
  obstacleLivraison,
} from "../../utils/caisse.utils";
import { messageErreurAction } from "../../utils/erreur-action.utils";
import {
  articlesAvecCadeaux,
  avisPoints,
  cadeauxNonProposes,
  pointsGagnes,
  pointsLisibles,
  pointsRetenus,
  problemesCadeau,
  remisePoints,
} from "../../utils/fidelite.utils";
import {
  lireCommandeEnAttente,
  lireMarquePaiement,
  oublierCommandeEnAttente,
} from "../../utils/memoire-navigateur.utils";
import {
  articlesHorsMode,
  articlesPayants,
  lignesACommander,
  nombreArticles,
  platsNonProposes,
  signaturePanier,
  sousTotal,
  telephoneLisible,
} from "../../utils/panier.utils";
import { fraisServiceEstimes } from "../../utils/reponses-api.utils";
import { creneauxRetrait, plageOuverte } from "../../utils/retrait.utils";
import { aPayer } from "../../utils/statut.utils";
import { lignesRecapDuPanier } from "../RecapitulatifPhotos";

import { barreCaisseAtom, etapeDemandeeAtom } from "./BarreEtapes";
import { EtapeAvantages } from "./EtapeAvantages";
import { EtapeConnexion } from "./EtapeConnexion";
import { EtapeLivraisonRetrait } from "./EtapeLivraisonRetrait";
import { EtapePaiement } from "./EtapePaiement";
import { AlerteMode, classePanneau, EtapePanier } from "./EtapePanier";
import { PiedEtape } from "./PiedEtape";
import { Recapitulatif } from "./Recapitulatif";
import {
  cadeauDemandeEpice,
  epiceDuCadeau,
  fenetreCreneau,
  inconnusDuTotal,
  libelleTotal,
  obstacleAvantages,
  obstaclePanier,
  problemesSansMode,
  textePreparation,
} from "./textes-caisse";

import { Bouton } from "@/components/site/Bouton";
import {
  lireRetraitDemande,
  oublierRetraitDemande,
  slugValide,
} from "@/components/site/carte/retrait-demande";
import { afficherMessage } from "@/components/site/MessageFlottant";
import { useMinuteCourante } from "@/components/site/restaurants/useMinuteCourante";
import { etatOuverture } from "@/features/restaurants/horaires";
import { nomCourt } from "@/features/restaurants/restaurant.utils";
import {
  adresseCourte,
  trouverRestaurant,
} from "@/features/restaurants/restaurants.site";
import { fcfa, INSECABLE, joli, kmTexte, nombre, pluriel } from "@/lib/typo";
import { cn } from "@/lib/utils";
import { formatImageUrl } from "@/utils/formatImageUrl";

/** Frais et restaurant de préparation calculés pour une adresse (« lat,lng »). */
interface ICalculLivraison {
  cle: string | null;
  frais: IFraisLivraison | null;
  erreur: string | null;
  /** Restaurant qui prépare, d'après l'itinéraire du serveur. */
  preparation: { id: string; nom: string; km: number | null } | null;
  /** Sous-total pour lequel les frais ont été calculés (les offres en dépendent). */
  pourTotal: number | null;
}

const CALCUL_VIDE: ICalculLivraison = {
  cle: null,
  frais: null,
  erreur: null,
  preparation: null,
  pourTotal: null,
};

/** Délai annoncé par le site (bandeau d'infos), jamais coupé en fin de ligne. */
const DELAI_LIVRAISON = `20${INSECABLE}à${INSECABLE}35${INSECABLE}min`;

/** « BIG CHICKEN offert » (libellé du cadeau) → « BIG CHICKEN ». */
const nomCadeau = (c: Pick<ICadeau, "nom">) =>
  c.nom.replace(/\s+offerte?$/i, "").trim() || c.nom;

const minuscule = (texte: string) =>
  texte.charAt(0).toLocaleLowerCase("fr") + texte.slice(1);

/**
 * Caisse en 5 étapes (plan, section 4 ; maquette, JS 794-1219) : Panier,
 * Connexion, Livraison ou retrait, Avantages, Paiement, avec le récapitulatif
 * toujours visible sur ordinateur et replié sur téléphone.
 *
 * Toutes les règles de commande sont celles du site (Panier.tsx avant la
 * refonte, tableau 4.3 du plan) : relecture du panier au catalogue,
 * livraison coupée au back office, articles vendus dans un seul mode,
 * créneaux horaires des plats, restaurants fermés ou qui ne proposent pas
 * un plat, frais lus sur l'API, code OU points (plafond, minimum, solde),
 * cadeaux contrôlés comme des plats, profil complet obligatoire, double
 * paiement évité. Le serveur revérifie tout à la création.
 *
 * Le panier, le mode, l'adresse et le restaurant vivent dans le navigateur
 * (stores) : la caisse ne s'affiche qu'une fois montée.
 */
export function Caisse({
  clientInitial,
  restaurants,
  erreurRestaurants,
  livraison,
  conditions,
  reglages,
  retraitDemande,
}: {
  clientInitial: IClient | null;
  restaurants: IRestaurantSite[];
  /** GET /restaurants a échoué : retrait impossible à proposer. */
  erreurRestaurants: boolean;
  livraison: ILivraisonDisponible;
  conditions: IConditionsCommande;
  /** Réglages de fidélité publics (points gagnés, pour tous), ou null. */
  reglages: IReglagesFidelite | null;
  /** `?retrait=<slug>` de l'adresse (« Retirer ici »). */
  retraitDemande: string | null;
}) {
  const router = useRouter();
  const lignes = useAtomValue(panierAtom);
  const changerQuantite = useSetAtom(changerQuantiteAtom);
  const vider = useSetAtom(viderPanierAtom);
  const rafraichir = useSetAtom(rafraichirPanierAtom);
  const retirerHorsMode = useSetAtom(retirerHorsModeAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const [adresse, setAdresse] = useAtom(adresseAtom);
  const [restaurantId, setRestaurantId] = useAtom(restaurantIdAtom);
  const [heure, setHeure] = useAtom(heureRetraitAtom);
  const [etape, setEtape] = useAtom(etapeAtom);
  const [etapeVue, setEtapeVue] = useAtom(etapeVueAtom);
  const allerEtape = useSetAtom(allerEtapeAtom);
  const [avantages, setAvantages] = useAtom(avantagesAtom);
  const oublierAvantages = useSetAtom(oublierAvantagesAtom);
  const setBarre = useSetAtom(barreCaisseAtom);
  const etapeDemandee = useAtomValue(etapeDemandeeAtom);
  const ficheBranchee = useAtomValue(ficheBrancheeAtom);
  const demanderFiche = useSetAtom(ficheDemandeeAtom);
  const minute = useMinuteCourante();

  // Le panier vit dans le navigateur : on attend d'être monté pour l'afficher.
  const [monte, setMonte] = useState(false);
  // Commande payée ou confiée au suivi : la page change.
  const [redirection, setRedirection] = useState<string | null>(null);
  const [client, setClient] = useState(clientInitial);
  const [deconnexion, setDeconnexion] = useState(false);
  const [erreurCompte, setErreurCompte] = useState<string | null>(null);
  const [revalidation, setRevalidation] = useState(false);
  const [relu, setRelu] = useState(false);
  const [prixMisAJour, setPrixMisAJour] = useState(false);
  const [fidelite, setFidelite] = useState<IFideliteClient | null>(null);
  const [chargementFidelite, setChargementFidelite] = useState(false);
  const [erreurFidelite, setErreurFidelite] = useState<string | null>(null);
  const [essaiFidelite, setEssaiFidelite] = useState(0);
  // Niveau d'épice des plats offerts, par plat : relu au catalogue.
  const [niveauxEpice, setNiveauxEpice] = useState<Record<string, NiveauEpice>>(
    {},
  );
  // Phrase de non-cumul (code OU points), montrée dans le bloc où le client a agi.
  const [avisCumul, setAvisCumul] = useState<{
    ou: "points" | "code";
    texte: string;
  } | null>(null);
  const [calcul, setCalcul] = useState<ICalculLivraison>(CALCUL_VIDE);
  const [calculFrais, setCalculFrais] = useState(false);
  const [erreurEtape, setErreurEtape] = useState<{
    etape: number;
    message: string;
  } | null>(null);
  const [erreurEpice, setErreurEpice] = useState<string | null>(null);

  const avantagesRef = useRef(avantages);

  avantagesRef.current = avantages;
  const calculRef = useRef(calcul);

  calculRef.current = calcul;
  // Le focus va au titre de l'étape quand le client change d'étape.
  const focusEtape = useRef(false);

  useEffect(() => setMonte(true), []);

  const profilComplet = !!client?.first_name && !!client?.last_name;
  const clientId = profilComplet ? (client?.id ?? null) : null;
  const maintenant = useMemo(
    () => (minute === null ? new Date() : new Date(minute)),
    [minute],
  );

  // ── Fin de parcours ────────────────────────────────────────────────────

  const quitter = (message: string, adresseSuite: string) => {
    setRedirection(message);
    vider();
    oublierCommandeEnAttente();
    setEtape(1);
    setEtapeVue(1);
    router.push(adresseSuite);
  };
  /** Commande payée : panier vidé, suivi (« Paiement accepté », points). */
  const terminerPaye = (id: string) =>
    quitter("Paiement accepté. Ouverture du suivi…", `/fr/commander/${id}`);
  /** Module de paiement indisponible : le suivi prend le relais avec « Payer ». */
  const confierAuSuivi = (id: string) =>
    quitter("Ouverture du paiement…", `/fr/commander/${id}?payer=1`);

  /**
   * Retour sur la caisse avec une commande créée dans cet onglet (rechargement
   * pendant le paiement, retour de l'application Mobile Money) : payée, elle
   * mène au suivi ; annulée ou illisible, elle est oubliée.
   */
  useEffect(() => {
    if (!monte) return;
    const attente = lireCommandeEnAttente();

    if (!attente) return;
    let panierDeLaCommande = false;

    try {
      panierDeLaCommande =
        JSON.parse(attente.signature).panier === signaturePanier(lignes);
    } catch {
      /* signature d'une autre version : on relit la commande */
    }
    if (lireMarquePaiement(attente.reference)?.succesA && panierDeLaCommande)
      return terminerPaye(attente.id);
    let actif = true;

    obtenirCommandeAction(attente.id)
      .then((res) => {
        if (!actif) return;
        if (res.ok && res.data.commande.paied) {
          if (panierDeLaCommande || !lignes.length) terminerPaye(attente.id);
          else oublierCommandeEnAttente();
        } else if (
          !res.ok ? res.statut !== undefined : !aPayer(res.data.commande)
        ) {
          oublierCommandeEnAttente();
        }
      })
      .catch(() => {
        /* réseau : « Payer » relira la commande */
      });

    return () => {
      actif = false;
    };
  }, [monte]);

  // ── Panier relu au catalogue ───────────────────────────────────────────

  /**
   * Le panier peut dater de plusieurs jours : un plat retiré est marqué et
   * écarté ; prix, modes, créneaux et restaurants sont remis à jour. Relecture
   * impossible : panier gardé tel quel, le serveur revérifie tout.
   */
  const relecture = useRef(false);

  useEffect(() => {
    if (!monte || relecture.current) return;
    if (!lignes.length) return setRelu(true);
    relecture.current = true;
    setRevalidation(true);
    revaliderPanierAction(lignes.map((l) => l.dish_id))
      .then((plats) => setPrixMisAJour(rafraichir(plats)))
      .catch(() => {
        /* relecture impossible : panier gardé tel quel */
      })
      .finally(() => {
        setRevalidation(false);
        setRelu(true);
      });
  }, [monte, lignes]);

  // ── « Retirer ici » d'un restaurant ────────────────────────────────────

  const retraitLu = useRef(false);

  useEffect(() => {
    if (!monte || retraitLu.current) return;
    retraitLu.current = true;
    if (retraitDemande !== null) {
      try {
        const url = new URL(window.location.href);

        url.searchParams.delete("retrait");
        // État `null` : Next recopie le sien et met à jour SA propre adresse.
        window.history.replaceState(
          null,
          "",
          `${url.pathname}${url.search}${url.hash}`,
        );
      } catch {
        /* adresse laissée telle quelle */
      }
    }
    const slug = slugValide(retraitDemande)
      ? retraitDemande
      : lireRetraitDemande();

    oublierRetraitDemande();
    const r = slug ? trouverRestaurant(restaurants, slug) : null;

    if (!r) return;
    setMode("PICKUP");
    setRestaurantId(r.id);
    setHeure(null);
    const etat = etatOuverture(r.schedule, new Date());
    const texte = `Retrait à ${r.nomAffiche}${etat.ouvert ? "." : `${INSECABLE}: ${minuscule(etat.texte)}.`}`;
    // Après les effets de la page : l'hôte du message est alors à l'écoute.
    const minuteur = setTimeout(() => afficherMessage(texte), 0);

    if (lignesACommander(lignes).length) {
      focusEtape.current = true;
      allerEtape(profilComplet ? 3 : 2);
    }

    return () => clearTimeout(minuteur);
  }, [monte]);

  // Livraison coupée au back office : on passe en retrait.
  useEffect(() => {
    if (monte && !livraison.disponible && mode === "DELIVERY")
      setMode("PICKUP");
  }, [monte, mode, livraison.disponible]);

  // ── Compte, points et cadeaux ──────────────────────────────────────────

  // Autre client, ou déconnexion : rien du précédent ne doit rester.
  const clientPrecedent = useRef(clientId);

  useEffect(() => {
    if (clientPrecedent.current === clientId) return;
    clientPrecedent.current = clientId;
    setFidelite(null);
    setNiveauxEpice({});
    setAvisCumul(null);
    oublierAvantages();
  }, [clientId]);

  /**
   * Points et cadeaux lus une fois la connexion finie, et relus après un
   * refus du serveur. La lecture précédente reste affichée jusqu'à la
   * nouvelle : un échec réseau ne retire pas en silence les points choisis.
   */
  useEffect(() => {
    setErreurFidelite(null);
    if (!clientId) return;
    let actif = true;

    setChargementFidelite(true);
    lireFideliteAction()
      .then((res) => {
        if (!actif) return;
        if (!res.ok) return setErreurFidelite(res.message);
        setFidelite(res.data);
        // Un cadeau qui n'est plus proposé est oublié.
        const proposes = new Set(res.data.cadeaux.map((c) => c.id));
        const choisis = avantagesRef.current.cadeaux;

        if (choisis.some((x) => !proposes.has(x)))
          setAvantages({ cadeaux: choisis.filter((x) => proposes.has(x)) });
      })
      .catch((e) => {
        if (actif) setErreurFidelite(messageErreurAction(e));
      })
      .finally(() => {
        if (actif) setChargementFidelite(false);
      });

    return () => {
      actif = false;
    };
  }, [clientId, essaiFidelite]);

  // Épicé ou non des plats offerts : imposé par le plat, ou à choisir.
  useEffect(() => {
    const aLire = (fidelite?.cadeaux ?? []).filter(
      (c) => c.type === "PLAT" && !(c.articleId in niveauxEpice),
    );

    if (!aLire.length) return;
    let actif = true;

    Promise.all(
      aLire.map(async (c): Promise<[string, NiveauEpice]> => {
        try {
          const res = await obtenirPlatAction(c.articleId);

          return [c.articleId, res.ok ? res.data.spice_level : "OPTIONAL"];
        } catch {
          return [c.articleId, "OPTIONAL"];
        }
      }),
    ).then((paires) => {
      if (actif)
        setNiveauxEpice((avant) => ({
          ...avant,
          ...Object.fromEntries(paires),
        }));
    });

    return () => {
      actif = false;
    };
  }, [fidelite]);

  // ── Frais de livraison ─────────────────────────────────────────────────

  const aCommander = lignesACommander(lignes);
  const total = sousTotal(lignes);
  const cleAdresse =
    mode === "DELIVERY" && adresse
      ? `${adresse.latitude},${adresse.longitude}`
      : null;
  const requete = useRef(0);

  /**
   * Nouvelle adresse : restaurant qui prépare et frais, en un appel
   * (itinéraire, facturé par Google, une fois par adresse). Même adresse,
   * autre montant : les frais seuls (les offres dépendent du montant).
   */
  useEffect(() => {
    if (!monte) return;
    if (!cleAdresse || !adresse) {
      requete.current++;
      setCalcul(CALCUL_VIDE);
      setCalculFrais(false);

      return;
    }
    const n = ++requete.current;
    const { latitude, longitude } = adresse;
    const nouvelle = calculRef.current.cle !== cleAdresse;

    setCalculFrais(true);
    (async () => {
      try {
        if (nouvelle) {
          const it = await itineraireLivraisonAction(
            latitude,
            longitude,
            total,
          );

          if (n !== requete.current) return;
          if (it.ok) {
            const r = it.data.restaurant;

            return setCalcul({
              cle: cleAdresse,
              frais: it.data.frais,
              erreur: null,
              preparation: r
                ? {
                    id: r.id,
                    nom:
                      restaurants.find((x) => x.id === r.id)?.nomAffiche ??
                      nomCourt(r.nom),
                    km: it.data.distanceKm,
                  }
                : null,
              pourTotal: total,
            });
          }
        }
        // Itinéraire indisponible (serveur plus ancien), ou montant changé.
        const f = await calculerFraisAction(latitude, longitude, total);

        if (n !== requete.current) return;
        setCalcul((avant) => ({
          cle: cleAdresse,
          frais: f.ok ? f.data : null,
          erreur: f.ok ? null : f.message,
          preparation: avant.cle === cleAdresse ? avant.preparation : null,
          pourTotal: total,
        }));
      } catch (e) {
        if (n !== requete.current) return;
        setCalcul((avant) => ({
          ...avant,
          cle: cleAdresse,
          frais: null,
          erreur: messageErreurAction(e),
          pourTotal: total,
        }));
      } finally {
        if (n === requete.current) setCalculFrais(false);
      }
    })();
  }, [monte, cleAdresse, total]);

  // ── État de la caisse ──────────────────────────────────────────────────

  const problemes = new Map(
    lignes.map((l) => [
      l.cle,
      l.retire ? [] : problemesSansMode(l, mode, maintenant),
    ]),
  );
  const lignesBloquees = aCommander.filter(
    (l) => (problemes.get(l.cle) ?? []).length > 0,
  );
  const panierPret = aCommander.length > 0 && lignesBloquees.length === 0;

  const cadeaux = fidelite?.cadeaux ?? [];
  const cadeauxRetenus = cadeaux.filter((c) =>
    avantages.cadeaux.includes(c.id),
  );
  const epices = avantages.epiceCadeaux;
  const epiceDe = (c: ICadeau) =>
    c.type === "PLAT"
      ? epiceDuCadeau(niveauxEpice[c.articleId], epices[c.id])
      : undefined;

  const autreMode: ModeCommande = mode === "DELIVERY" ? "PICKUP" : "DELIVERY";
  const horsMode = articlesHorsMode(lignes, mode);
  const basculePossible =
    (autreMode === "PICKUP" || livraison.disponible) &&
    articlesHorsMode(lignes, autreMode).length === 0;

  const restaurantsVue: IRetraitVue[] = restaurants.map((r) => ({
    id: r.id,
    nom: r.nomAffiche,
    adresse: r.adresseCourte,
    photo: r.image ? formatImageUrl(r.image) : null,
    ouvert: !!plageOuverte(r.schedule, maintenant),
    etat: etatOuverture(r.schedule, maintenant).texte,
    absents: [
      ...platsNonProposes(lignes, r.id),
      ...cadeauxNonProposes(cadeauxRetenus, r.id),
    ],
    creneaux: creneauxRetrait(r.schedule, maintenant),
  }));
  const retraitChoisi =
    restaurantsVue.find((r) => r.id === restaurantId) ?? null;
  const toutesFermees =
    restaurantsVue.length > 0 && restaurantsVue.every((r) => !r.ouvert);

  const fraisConnus = calcul.cle === cleAdresse && calcul.frais !== null;
  const obstacle3 =
    mode === "DELIVERY" &&
    adresse &&
    livraison.disponible &&
    !horsMode.length &&
    calcul.cle === cleAdresse &&
    calcul.erreur
      ? calcul.erreur
      : obstacleLivraison({
          mode,
          livraisonOuverte: livraison.disponible,
          adresse,
          fraisConnus,
          horsMode,
          retrait: retraitChoisi,
          heure,
        });

  // Points : jamais avec un code, ramenés au maximum de ce panier.
  const f = fidelite?.points ?? null;
  const code = avantages.code;
  const retenus = code ? 0 : pointsRetenus(avantages.points, f, total);
  const remiseDesPoints = remisePoints(retenus, f, total);
  const ajustement = code ? null : avisPoints(avantages.points, f, total);

  // Cadeaux : mêmes contrôles que le serveur, et place des suppléments offerts.
  const { nonPlaces } = articlesAvecCadeaux(
    articlesPayants(lignes),
    cadeauxRetenus,
  );
  const problemesCadeaux = new Map(
    cadeaux.map((c) => [
      c.id,
      [
        ...problemesCadeau(c, mode, maintenant),
        ...(nonPlaces.some((n) => n.id === c.id)
          ? [
              "Chaque plat du panier a déjà ce supplément. Ajoutez un plat ou retirez ce cadeau.",
            ]
          : []),
      ],
    ]),
  );
  const cadeauxBloques = cadeauxRetenus.filter(
    (c) => (problemesCadeaux.get(c.id) ?? []).length > 0,
  );
  const demandeEpice = (c: ICadeau) =>
    cadeauDemandeEpice(c, niveauxEpice[c.articleId]);
  const sansEpice = cadeauxRetenus.filter(
    (c) => demandeEpice(c) && !(c.id in epices),
  );

  const etat: IEtatCaisse = {
    panierPret,
    connecte: profilComplet,
    livraisonPrete: obstacle3 === null,
    avantagesPrets: !cadeauxBloques.length && !sansEpice.length,
  };
  const max = etapeMaximale(etat);
  const affichee = etapeAccessible(etape, etat);
  const faites: EtapeCaisse[] = [];

  if (panierPret) faites.push(1);
  if (profilComplet) faites.push(2);
  if (profilComplet && etat.livraisonPrete) faites.push(3);
  // Avantages : faite une fois vue, et seulement si rien ne bloque après.
  if (max === 5 && etapeVue >= 4) faites.push(4);
  const libelle3 = aCommander.length
    ? mode === "DELIVERY"
      ? "Livraison"
      : "Retrait"
    : "Livraison ou retrait";

  // ── Totaux ─────────────────────────────────────────────────────────────

  const fraisLivraison =
    mode === "DELIVERY"
      ? fraisConnus && calcul.frais
        ? calcul.frais.montant
        : null
      : 0;
  const fraisService = fraisServiceEstimes(total, conditions.tauxFraisService);
  const remise = code
    ? { libelle: `Code ${code.code}`, montant: code.remise }
    : retenus > 0
      ? {
          libelle: `Points de fidélité (${nombre(retenus)})`,
          montant: remiseDesPoints,
        }
      : null;
  const montantRemise = remise ? Math.min(remise.montant, total) : 0;
  const totalEstime =
    Math.max(0, total - montantRemise) +
    (fraisLivraison ?? 0) +
    (fraisService ?? 0);
  const texteTotal = libelleTotal(
    inconnusDuTotal(mode, fraisLivraison, fraisService),
  );
  const pointsParFranc = f?.pointsParFranc ?? reglages?.pointsParFranc ?? 0;
  const gagnes = pointsGagnes(total, pointsParFranc);

  const preparation = calcul.cle === cleAdresse ? calcul.preparation : null;
  const lieu =
    mode === "DELIVERY"
      ? {
          titre: "Livraison",
          detail: adresse
            ? `${adresseCourte(adresse.libelle) ?? adresse.libelle}${preparation ? `, préparée à ${preparation.nom}${preparation.km ? ` (${kmTexte(preparation.km)})` : ""}` : ""}`
            : "Adresse à choisir",
        }
      : {
          titre: "Retrait au restaurant",
          detail: retraitChoisi
            ? `${retraitChoisi.nom}, ${heure ? `de ${fenetreCreneau(new Date(heure))}` : "dès que possible"}`
            : "Restaurant à choisir",
        };
  const cadeauxRecap = cadeauxRetenus.map((c) => ({
    ...c,
    nom: nomCadeau(c),
    epice: epiceDe(c),
  }));
  const recap: IRecapCaisse = {
    lieu,
    lignes: lignesRecapDuPanier(lignes, cadeauxRecap),
    nombreArticles: nombreArticles(lignes),
    sousTotal: total,
    remise,
    cadeaux: cadeauxRecap.map((c) => (c.type === "PLAT" ? c.nom : joli(c.nom))),
    mode,
    livraison: fraisLivraison,
    fraisService,
    tauxFraisService: conditions.tauxFraisService,
    total: totalEstime,
    note:
      gagnes >= 1
        ? `Payée en ligne, cette commande vous rapportera ${pointsLisibles(gagnes)}.`
        : null,
  };

  // ── Barre des étapes, étape ramenée au possible, focus ─────────────────

  useEffect(() => {
    if (!monte) return;
    setBarre({ actuelle: affichee, max, faites: [...faites], libelle3 });
  }, [monte, affichee, max, faites.join(","), libelle3]);

  // Étape plus loin que possible (panier modifié, retour arrière) : ramenée,
  // sauf pendant un calcul passager (relecture du panier, frais).
  const calculEnAttente =
    !relu || revalidation || (!!cleAdresse && calcul.cle !== cleAdresse);

  useEffect(() => {
    if (!monte || calculEnAttente || redirection) return;
    if (etape !== affichee) setEtape(affichee);
  }, [monte, calculEnAttente, redirection, etape, affichee]);

  // Clic sur une pilule de la barre (dans l'en-tête).
  useEffect(() => {
    if (!etapeDemandee) return;
    focusEtape.current = true;
    setErreurEtape(null);
  }, [etapeDemandee]);

  // Le titre visé n'existe qu'une fois l'étape changée à l'écran : on attend
  // ce changement (ou un clic sur la barre) avant de donner le focus.
  const etapeAffichee = useRef(affichee);
  const demandeVue = useRef(etapeDemandee);

  useEffect(() => {
    const change =
      etapeAffichee.current !== affichee ||
      demandeVue.current !== etapeDemandee;

    etapeAffichee.current = affichee;
    demandeVue.current = etapeDemandee;
    if (!monte || !focusEtape.current || !change) return;
    focusEtape.current = false;
    const reduit = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const tete = document.getElementById("tete-caisse");
    const entete =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--h-entete",
        ),
      ) || 64;

    if (tete) {
      // On remonte jusqu'au titre, sous l'en-tête collant, sans le couper.
      const y = Math.max(
        0,
        tete.getBoundingClientRect().top + window.scrollY - entete,
      );

      if (window.scrollY > y + 60)
        window.scrollTo({ top: y, behavior: reduit ? "auto" : "smooth" });
    }
    document.getElementById("t-etape")?.focus({ preventScroll: true });
  }, [monte, affichee, etapeDemandee]);

  // ── Gestes ─────────────────────────────────────────────────────────────

  const aller = (n: number) => {
    setErreurEtape(null);
    setErreurEpice(null);
    focusEtape.current = true;
    allerEtape(etapeAccessible(n, etat));
  };

  /** Pourquoi l'étape `n` bloque, en une phrase. */
  const raison = (n: EtapeCaisse): string => {
    if (n === 1)
      return revalidation
        ? "Vérification des plats du panier en cours. Un instant."
        : (obstaclePanier({
            aCommander: aCommander.length,
            lignesBloquees: lignesBloquees.map((l) => l.nom),
          }) ?? "");
    if (n === 2) return "Connectez-vous pour continuer.";
    if (n === 3) return obstacle3 ?? "";
    if (n === 4)
      return (
        obstacleAvantages({
          cadeauxBloques: cadeauxBloques.map(nomCadeau),
          sansEpice: sansEpice.map(nomCadeau),
        }) ?? ""
      );

    return "";
  };

  /** Montre ce qui bloque, à l'étape qui bloque (on y mène si besoin). */
  const montrerObstacle = () => {
    const bloquante = max;
    const message = raison(bloquante);

    if (bloquante !== affichee) aller(bloquante);
    if (bloquante === 4 && !cadeauxBloques.length && sansEpice[0]) {
      setErreurEpice(sansEpice[0].id);
      setTimeout(
        () =>
          document
            .getElementById(`cadeau-${sansEpice[0].id}-epice-oui`)
            ?.focus(),
        0,
      );
    }
    if (!message) return;
    setErreurEtape({ etape: bloquante, message });
    setTimeout(
      () =>
        document
          .getElementById("etape-erreur")
          ?.scrollIntoView({ block: "center" }),
      0,
    );
  };

  const suivant = (n: number) => {
    if (n <= max && !(revalidation && affichee === 1)) return aller(n);
    montrerObstacle();
  };

  const erreurDe = (n: number) =>
    erreurEtape && erreurEtape.etape === n ? erreurEtape.message : null;

  const pied = (n: EtapeCaisse, bouton: ReactNode) => (
    <PiedEtape
      libelleTotal={texteTotal}
      pleineLargeur={n === 5}
      total={totalEstime}
      onRetour={n > 1 ? () => aller(n - 1) : undefined}
    >
      {bouton}
    </PiedEtape>
  );
  const continuer = (n: EtapeCaisse) =>
    pied(
      n,
      <Bouton
        aria-busy={(n === 1 && revalidation) || undefined}
        iconeFin="fleche"
        taille="grand"
        onClick={() => suivant(n + 1)}
      >
        Continuer
      </Bouton>,
    );

  const alerte =
    aCommander.length && horsMode.length ? (
      <AlerteMode
        basculePossible={basculePossible}
        mode={mode}
        noms={horsMode}
        onBasculer={() => {
          setMode(autreMode);
          setErreurEtape(null);
          afficherMessage(
            autreMode === "PICKUP"
              ? "Commande passée en retrait au restaurant."
              : "Commande passée en livraison.",
          );
        }}
        onRetirer={() => {
          retirerHorsMode(mode);
          setErreurEtape(null);
          afficherMessage(
            mode === "DELIVERY"
              ? `Articles à emporter retirés${INSECABLE}: la livraison est possible.`
              : "Articles retirés du panier.",
          );
        }}
      />
    ) : null;

  const seDeconnecter = async () => {
    setErreurCompte(null);
    setDeconnexion(true);
    try {
      await deconnexionAction();
      setClient(null);
      afficherMessage("Vous êtes déconnecté.");
    } catch (e) {
      setErreurCompte(messageErreurAction(e));
    } finally {
      setDeconnexion(false);
    }
  };

  const appliquerCode = async (saisi: string): Promise<string | null> => {
    try {
      const res = await verifierCodeReductionAction(saisi, lignes, total);

      if (!res.ok) return res.message;
      const avaitDesPoints = retenus > 0;

      setAvantages({ code: res.data, points: 0 });
      setAvisCumul(
        avaitDesPoints
          ? {
              ou: "code",
              texte: `Vos points ont été retirés${INSECABLE}: un code et des points ne se cumulent pas.`,
            }
          : null,
      );
      afficherMessage(`Code ${res.data.code} appliqué.`);

      return null;
    } catch (e) {
      return messageErreurAction(e);
    }
  };

  const creation: ICreationCommande = {
    mode,
    lignes,
    adresse: mode === "DELIVERY" ? adresse : null,
    restaurantId: mode === "PICKUP" ? restaurantId : null,
    heureRetrait: mode === "PICKUP" ? heure : null,
    code: code?.code ?? null,
    points: retenus,
    cadeaux: cadeauxRetenus.map((c) => {
      const epice = epiceDe(c);

      return {
        id: c.id,
        type: c.type,
        articleId: c.articleId,
        nom: c.nom,
        ...(typeof epice === "boolean" ? { epice } : {}),
      };
    }),
  };

  const resume: ILigneResume[] = [
    mode === "DELIVERY"
      ? {
          titre: (
            <>
              <b>Livraison</b> ·{" "}
              {adresse
                ? (adresseCourte(adresse.libelle) ?? adresse.libelle)
                : ""}
            </>
          ),
          detail: [
            adresse?.repere.trim()
              ? `Repère${INSECABLE}: ${adresse.repere.trim()}`
              : null,
            `${DELAI_LIVRAISON}${preparation ? `, depuis ${preparation.nom}` : ""}`,
          ]
            .filter(Boolean)
            .join(" · "),
          modifier: { libelle: "Modifier", etape: 3 },
        }
      : {
          titre: (
            <>
              <b>Retrait</b> · {retraitChoisi?.nom ?? ""}
            </>
          ),
          detail: heure
            ? `Créneau de ${fenetreCreneau(new Date(heure))}`
            : "Dès que possible",
          modifier: { libelle: "Modifier", etape: 3 },
        },
    {
      titre: (
        <b>
          {client?.first_name} {client?.last_name}
        </b>
      ),
      detail: client
        ? `+225${INSECABLE}${telephoneLisible(client.phone).replace(/ /g, INSECABLE)}`
        : "",
    },
    {
      titre: <b>{pluriel(nombreArticles(lignes), "article", "articles")}</b>,
      detail: [
        code
          ? `Code ${code.code}`
          : retenus > 0
            ? pluriel(retenus, "point utilisé", "points utilisés")
            : "Sans code ni points",
        cadeauxRetenus.length
          ? pluriel(cadeauxRetenus.length, "cadeau", "cadeaux")
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
      modifier: { libelle: "Modifier ma commande", etape: 1 },
    },
  ];

  // ── Rendu ──────────────────────────────────────────────────────────────

  let contenu: ReactNode;

  if (!monte || redirection) {
    contenu = (
      <section
        aria-busy="true"
        aria-label="Votre commande"
        className={cn(classePanneau, "min-h-[280px] content-center")}
      >
        <p
          className="flex items-center gap-2.5 text-sm text-encre-doux"
          role="status"
        >
          <span
            aria-hidden="true"
            className="size-5 animate-spin rounded-full border-2 border-trait border-t-orange motion-reduce:animate-none"
          />
          {redirection ?? "Chargement de votre panier…"}
        </p>
      </section>
    );
  } else if (affichee === 1 || !lignes.length) {
    contenu = (
      <EtapePanier
        alerte={alerte}
        erreur={erreurDe(1)}
        lignes={lignes}
        mode={mode}
        pied={continuer(1)}
        platsOfferts={cadeauxRetenus
          .filter((c) => c.type === "PLAT")
          .map((c) => ({
            id: c.id,
            articleId: c.articleId,
            nom: nomCadeau(c),
            image: c.image,
            epice: epiceDe(c),
          }))}
        prixMisAJour={prixMisAJour}
        problemes={problemes}
        revalidation={revalidation}
        supplementsOfferts={cadeauxRetenus
          .filter((c) => c.type === "SUPPLEMENT")
          .map(nomCadeau)}
        onModifier={
          ficheBranchee
            ? (i) => demanderFiche({ platId: lignes[i].dish_id, indexLigne: i })
            : undefined
        }
        onQuantite={(l: ILignePanier, quantite: number) =>
          changerQuantite({ cle: l.cle, quantite })
        }
        onRetirer={(l: ILignePanier) => {
          changerQuantite({ cle: l.cle, quantite: 0 });
          afficherMessage(`${joli(l.nom)} retiré du panier.`);
        }}
        onVider={() => {
          vider();
          afficherMessage("Panier vidé.");
        }}
      />
    );
  } else if (affichee === 2) {
    contenu = (
      <EtapeConnexion
        client={client}
        deconnexion={deconnexion}
        erreur={erreurCompte}
        pied={continuer(2)}
        points={f?.solde ?? null}
        onConnecte={(c) => {
          setClient(c);
          setErreurEtape(null);
          // Pas de `aller` : l'état de la caisse ne connaît pas encore le
          // client ; l'étape est ramenée au possible au rendu suivant.
          focusEtape.current = true;
          allerEtape(3);
        }}
        onDeconnecter={seDeconnecter}
      />
    );
  } else if (affichee === 3) {
    contenu = (
      <EtapeLivraisonRetrait
        adresse={adresse}
        alerte={alerte}
        connecte={profilComplet}
        detailAdresse={
          <>
            {preparation ? (
              <p>
                {textePreparation(preparation.nom, preparation.km)}. Il peut
                changer si un plat n&apos;y est pas proposé.
              </p>
            ) : null}
            {calculFrais ? (
              <p role="status">Calcul des frais de livraison…</p>
            ) : fraisConnus && calcul.frais ? (
              <p className="font-semibold text-encre">
                {calcul.frais.montant === 0
                  ? "Livraison offerte"
                  : `Livraison ${fcfa(calcul.frais.montant)}`}
                {calcul.frais.montantAvantOffre ? (
                  <s className="ml-1.5 font-normal text-encre-doux">
                    {fcfa(calcul.frais.montantAvantOffre)}
                  </s>
                ) : null}
                {calcul.frais.offre ? ` · ${calcul.frais.offre}` : ""} ·{" "}
                {DELAI_LIVRAISON}
              </p>
            ) : calcul.erreur && calcul.cle === cleAdresse ? (
              <p className="font-semibold text-rouge" role="alert">
                {calcul.erreur}
              </p>
            ) : null}
          </>
        }
        erreur={erreurDe(3)}
        erreurRestaurants={erreurRestaurants}
        grille={conditions.grille}
        heure={heure}
        livraison={livraison}
        mode={mode}
        pied={continuer(3)}
        restaurantId={restaurantId}
        restaurants={restaurantsVue}
        toutesFermees={toutesFermees}
        onAdresse={(a) => {
          setAdresse(a);
          setErreurEtape(null);
        }}
        onHeure={(h) => {
          setHeure(h);
          setErreurEtape(null);
        }}
        onMode={(m) => {
          setMode(m);
          setErreurEtape(null);
        }}
        onRestaurant={(id) => {
          setRestaurantId(id);
          setErreurEtape(null);
        }}
      />
    );
  } else if (affichee === 4) {
    contenu = (
      <EtapeAvantages
        avisCode={avisCumul?.ou === "code" ? avisCumul.texte : null}
        avisPoints={avisCumul?.ou === "points" ? avisCumul.texte : ajustement}
        cadeaux={cadeaux}
        cadeauxChoisis={avantages.cadeaux}
        chargementFidelite={chargementFidelite}
        code={code}
        demandeEpice={demandeEpice}
        epices={epices}
        erreur={erreurDe(4)}
        erreurEpice={erreurEpice}
        erreurFidelite={erreurFidelite}
        panierPayant={aCommander.length > 0}
        pied={continuer(4)}
        points={f}
        pointsRetenus={retenus}
        problemesCadeaux={problemesCadeaux}
        remisePoints={remiseDesPoints}
        sousTotal={total}
        onAppliquerCode={appliquerCode}
        onBasculerCadeau={(id) => {
          const retire = avantages.cadeaux.includes(id);
          const reste = { ...epices };

          if (retire) delete reste[id];
          setAvantages({
            cadeaux: retire
              ? avantages.cadeaux.filter((x) => x !== id)
              : [...avantages.cadeaux, id],
            epiceCadeaux: reste,
          });
          setErreurEtape(null);
          afficherMessage(
            retire
              ? "Cadeau retiré de la commande."
              : "Cadeau ajouté à la commande.",
          );
        }}
        onEpice={(id, e) => {
          setAvantages({ epiceCadeaux: { ...epices, [id]: e } });
          if (erreurEpice === id) setErreurEpice(null);
          setErreurEtape(null);
        }}
        onRecharger={() => setEssaiFidelite((n) => n + 1)}
        onRetirerCode={() => {
          setAvantages({ code: null });
          setAvisCumul(null);
          afficherMessage("Code retiré.");
        }}
        onRetirerPoints={() => {
          setAvantages({ points: 0 });
          setAvisCumul(null);
          afficherMessage("Points retirés.");
        }}
        onUtiliserPoints={(n) => {
          setAvisCumul(
            code
              ? {
                  ou: "points",
                  texte: `Le code ${code.code} a été retiré${INSECABLE}: un code et des points ne se cumulent pas.`,
                }
              : null,
          );
          setAvantages({ points: n, code: null });
          afficherMessage(`${pluriel(n, "point utilisé", "points utilisés")}.`);
        }}
      />
    );
  } else {
    contenu = client ? (
      <EtapePaiement
        aCommander={aCommander}
        client={client}
        creation={creation}
        pied={(bouton) => pied(5, bouton)}
        pointsRetenus={retenus}
        pretAPayer={!revalidation && !calculFrais}
        remiseDesPoints={remiseDesPoints}
        resume={resume}
        totalEstime={totalEstime}
        verifier={() => {
          if (max === 5 && !revalidation && !calculFrais) return true;
          montrerObstacle();

          return false;
        }}
        onAller={(n) => aller(n)}
        onPaye={terminerPaye}
        onRefus={() => {
          if (retenus > 0 || cadeauxRetenus.length)
            setEssaiFidelite((n) => n + 1);
        }}
        onRelais={confierAuSuivi}
      />
    ) : null;
  }

  const recapVisible = monte && !redirection && lignes.length > 0;

  return (
    <div className="mx-auto grid w-full max-w-(--largeur) grid-cols-1 items-start gap-5 px-(--gouttiere-caisse) pt-6 pb-12 min-[1000px]:grid-cols-[minmax(0,1fr)_380px] min-[1000px]:gap-7 min-[1000px]:pt-8 min-[1000px]:pb-16">
      <div className="grid min-w-0 content-start gap-4">
        {recapVisible ? <Recapitulatif recap={recap} variante="volet" /> : null}
        {contenu}
      </div>
      {recapVisible ? <Recapitulatif recap={recap} variante="colonne" /> : null}
    </div>
  );
}
