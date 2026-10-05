"use client";

import type {
  IClient,
  ICommande,
  IConfigPaiement,
  Resultat,
} from "../types/commande.types";

import { useCallback, useEffect, useRef, useState } from "react";

import { obtenirCommandeAction } from "../actions/commande.action";
import { useActionsCommande } from "../hooks/useActionsCommande";
import { usePaiementCommande } from "../hooks/usePaiementCommande";
import {
  actionPerimee,
  messageErreurAction,
} from "../utils/erreur-action.utils";
import { articlesDeCommande } from "../utils/analytique.utils";
import { pointsLisibles } from "../utils/fidelite.utils";
import {
  etatPaiement,
  type IEcartPoints,
  lireEcartPoints,
  lireMarquePaiement,
  oublierEcartPoints,
  oublierPanierCommande,
} from "../utils/memoire-navigateur.utils";
import { aPayer, estTerminee } from "../utils/statut.utils";
import {
  creneauRetrait,
  dateCommande,
  estServie,
  etapesFrise,
  lieuCommande,
  peutRecommander,
  pointsCredites,
  restaurantDeCommande,
  textePointsCredites,
  texteTranche,
} from "../utils/suivi.utils";

import { BoutonRecommander, ConfirmationModifier } from "./ActionsCommande";
import { EnteteEcran } from "./EnteteEcran";
import { FriseSuivi, PastilleStatut } from "./FriseSuivi";
import {
  lignesRecapDeCommande,
  RecapitulatifPhotos,
} from "./RecapitulatifPhotos";
import { Totaux } from "./Totaux";

import { BadgesStores } from "@/components/site/BadgesStores";
import { Bouton, LienBouton } from "@/components/site/Bouton";
import { Icone } from "@/components/site/Icone";
import { Lien } from "@/components/site/Lien";
import { Conteneur } from "@/components/site/Section";
import { evenementCommerce } from "@/lib/analytique";
import { fcfa, INSECABLE, joli, TELEPHONE, telLien } from "@/lib/typo";
import { cn } from "@/lib/utils";

/** Numéro du site, le seul affiché (retouche 6), jamais coupé en fin de ligne. */
const NUMERO = TELEPHONE.replace(/ /g, INSECABLE);

/** Paiement commencé ou annoncé dans ce navigateur depuis moins de 30 min : « Paiement accepté ». */
const DELAI_PAIEMENT_RECENT_MS = 30 * 60 * 1000;

const PANNEAU =
  "grid min-w-0 gap-4 rounded-panneau border border-trait bg-white px-[18px] py-5 md:px-7 md:py-[26px]";
const TITRE_PANNEAU = "text-xl leading-tight font-bold";
const LIEN_TEL =
  "font-semibold whitespace-nowrap text-orange-texte underline underline-offset-2 hover:text-encre";

/**
 * Message d'une lecture en échec. Commande introuvable (404) : souvent une
 * commande non payée annulée pour être modifiée, que le serveur ne montre plus.
 */
const messageLecture = (r: { message: string; statut?: number }) =>
  r.statut === 404
    ? "Cette commande est introuvable. Elle a peut-être été remplacée par une nouvelle commande."
    : r.message;

/** Lien vers le seul numéro du site (tel:). */
function Numero() {
  return (
    <a className={LIEN_TEL} href={telLien()}>
      {NUMERO}
    </a>
  );
}

/**
 * « Une question ? Appelez le 27 21 71 21 30. » Jamais le numéro d'un
 * restaurant : le seul numéro affiché par le site est celui du centre d'appels.
 */
function AppelSite() {
  return (
    <>
      Une question{INSECABLE}? Appelez le <Numero />.
    </>
  );
}

/** Roue de chargement (maquette, CSS 1448), immobile avec le mouvement réduit. */
function Roue({ petite }: { petite?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block shrink-0 rounded-full border-trait border-t-orange motion-safe:animate-spin",
        petite ? "size-6 border-[3px]" : "size-[46px] border-4",
      )}
    />
  );
}

/**
 * Suivi d'une commande (maquette, écran « Suivi », JS 1376-1446), avec les
 * garde-fous du site :
 *  - paiement par usePaiementCommande (marque cn-paiement-<référence>, états
 *    confirmation et vérification), jamais d'ouverture automatique du module ;
 *  - relectures numérotées (une réponse lente ne remplace pas une plus
 *    récente), plus lentes onglet caché, arrêtées sur une commande terminée ;
 *  - ?payer=1 retiré de l'adresse, avertissement d'écart de points ;
 *  - « Paiement accepté », points crédités et carte à gratter juste après un
 *    paiement fait dans ce navigateur (ici ou à l'étape Paiement de la caisse) ;
 *  - frise, code de récupération (seulement s'il vient de l'API), lieu,
 *    récapitulatif avec photos, « Modifier » tant qu'elle n'est pas payée,
 *    « Recommander » une fois servie ou annulée ;
 *  - seul numéro affiché : 27 21 71 21 30.
 * La commande arrive déjà lue par la page (rendu serveur) : rien n'attend.
 */
export default function SuiviCommande({
  id,
  client,
  ouvrirPaiement,
  lectureInitiale,
  pointsParFranc,
}: {
  id: string;
  client: IClient;
  ouvrirPaiement: boolean;
  /** Lecture faite par la page au rendu serveur (absente : lue au montage). */
  lectureInitiale?: Resultat<{
    commande: ICommande;
    paiement: IConfigPaiement | null;
  }>;
  /** Points gagnés par franc (réglages de fidélité), ou null s'ils sont illisibles. */
  pointsParFranc: number | null;
}) {
  const initiale = lectureInitiale?.ok ? lectureInitiale.data : null;
  const [commande, setCommande] = useState<ICommande | null>(
    initiale?.commande ?? null,
  );
  const [paiement, setPaiement] = useState<IConfigPaiement | null>(
    initiale?.paiement ?? null,
  );
  const [erreur, setErreur] = useState<string | null>(
    lectureInitiale && !lectureInitiale.ok
      ? messageLecture(lectureInitiale)
      : null,
  );
  // Commande disparue (404) : « Mes commandes » plutôt que « Recharger ».
  const [introuvable, setIntrouvable] = useState(
    !!lectureInitiale && !lectureInitiale.ok && lectureInitiale.statut === 404,
  );
  // Relecture arrêtée : page à recharger (redéploiement, session expirée) ou
  // commande disparue. Relire ne changerait rien, on propose de recharger.
  const [arrete, setArrete] = useState(
    !!lectureInitiale &&
      !lectureInitiale.ok &&
      (lectureInitiale.statut === 404 || lectureInitiale.statut === 401),
  );
  const [horloge, setHorloge] = useState(() => Date.now());
  // Remise des points plus faible que celle estimée au panier (cf. caisse).
  const [ecartPoints, setEcartPoints] = useState<IEcartPoints | null>(null);
  // Payée juste après une tentative faite dans ce navigateur.
  const [justePaye, setJustePaye] = useState(false);
  const titrePaye = useRef<HTMLHeadingElement>(null);
  const titreAvance = useRef<HTMLHeadingElement>(null);
  // Numéros des relectures : une réponse lente, dépassée par une plus récente,
  // est ignorée. Sinon une ancienne réponse « non payée » arrivée après la
  // réponse « payée » réaffichait le bouton « Payer » (marque déjà effacée).
  const lectures = useRef({ envoyees: 0, appliquee: 0 });
  const { modifier, enCours, erreur: erreurModif } = useActionsCommande();

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
        setErreur(messageLecture(res));
        setIntrouvable(res.statut === 404);
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
      if (actionPerimee(e) || n >= lectures.current.appliquee)
        setErreur(messageErreurAction(e));
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
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    } catch {
      /* adresse laissée telle quelle */
    }
  }, [ouvrirPaiement]);

  useEffect(() => {
    setEcartPoints(lireEcartPoints(id));
  }, [id]);

  const reference = commande?.reference ?? null;
  const paye = !!commande?.paied;

  // Ouverture du module, marque cn-paiement-<référence>, succès et échec
  // (usePaiementCommande) ; après chacun, la commande est relue.
  const {
    pret,
    erreurChargement,
    reessayer,
    payer: ouvrirPaiementCommande,
    echec,
    marque,
    oublierMarque,
  } = usePaiementCommande({
    reference,
    client,
    apresSucces: () => {
      setHorloge(Date.now());
      relire();
    },
    apresEchec: () => relire(),
  });

  // Dernière lecture de la commande, pour la mesure de l'achat ci-dessous
  // (sans relancer cet effet à chaque relecture).
  const commandeLue = useRef(commande);

  useEffect(() => {
    commandeLue.current = commande;
  }, [commande]);

  // Payée : la tentative et le panier gardé ne servent plus. Une tentative
  // récente de ce navigateur (module ouvert ou succès annoncé, ici ou à la
  // caisse) veut dire que le client vient de payer : « Paiement accepté ».
  useEffect(() => {
    if (!paye || !reference) return;
    const m = lireMarquePaiement(reference);
    const derniere = Math.max(m?.succesA ?? 0, m?.ouvertA ?? 0);

    if (derniere && Date.now() - derniere < DELAI_PAIEMENT_RECENT_MS) {
      setJustePaye(true);
      // Mesure d'audience (GA4) : achat compté une seule fois, la marque de
      // paiement étant effacée juste après.
      const payee = commandeLue.current;

      if (payee)
        evenementCommerce("purchase", articlesDeCommande(payee), {
          transaction_id: reference,
          value: payee.amount,
        });
    }
    oublierMarque(reference);
    oublierPanierCommande(id);
    oublierEcartPoints(id);
    setEcartPoints(null);
  }, [paye, reference, id, oublierMarque]);

  // Le titre « Paiement accepté » reçoit le focus : il est lu tout de suite.
  useEffect(() => {
    if (justePaye) titrePaye.current?.focus();
  }, [justePaye]);

  const etat =
    commande && aPayer(commande) ? etatPaiement(marque, horloge) : "libre";
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
    const t = setInterval(
      () => {
        if (visible()) relire();
      },
      rapide ? 4000 : 15000,
    );
    const auRetour = () => {
      if (visible()) relire();
    };

    document.addEventListener("visibilitychange", auRetour);

    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", auRetour);
    };
  }, [relire, rapide, termine, arrete]);

  const payer = useCallback(() => {
    if (!commande || !paiement || !aPayer(commande)) return;
    ouvrirPaiementCommande(commande, paiement);
  }, [commande, paiement, ouvrirPaiementCommande]);

  // Pas d'ouverture automatique du module de paiement : KKiaPay ignore un
  // appel fait avant d'avoir fini de se préparer, sans aucun moyen de le
  // savoir. La fenêtre restait vide, et la page croyait à tort qu'un paiement
  // avait commencé. Le client paie donc toujours par le bouton « Payer ».

  const recharger = () => window.location.assign(window.location.pathname);

  const bandeauErreur = erreur ? (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-carte bg-rouge-fond px-4 py-3 text-sm text-rouge"
      role="alert"
    >
      <span>{erreur}</span>
      {introuvable ? (
        <LienBouton href="/fr/commander/mes-commandes" variante="sombre">
          Mes commandes
        </LienBouton>
      ) : arrete ? (
        <Bouton variante="sombre" onClick={recharger}>
          Recharger
        </Bouton>
      ) : null}
    </div>
  ) : null;

  const entete = (
    <EnteteEcran fond="jaune" id="titre-suivi" titre="Suivi de commande">
      {commande ? (
        <>
          {/* Sur téléphone, la pastille passe sous la référence, qui ne se coupe jamais. */}
          <div className="flex flex-col items-start gap-x-3 gap-y-1.5 sm:flex-row sm:flex-wrap sm:items-center">
            <p className="text-[clamp(15px,4.6vw,18px)] leading-snug font-bold">
              Commande{" "}
              <span className="whitespace-nowrap">{commande.reference}</span>
            </p>
            <PastilleStatut className="bg-white" commande={commande} />
          </div>
          <p className="text-sm">
            {dateCommande(commande.created_at)} · {fcfa(commande.amount)}
            {commande.paied ? " payés" : aPayer(commande) ? " à payer" : ""}
          </p>
        </>
      ) : null}
    </EnteteEcran>
  );

  if (!commande) {
    return (
      <>
        {entete}
        <Conteneur className="grid gap-4 pt-6 pb-14 min-[1000px]:pt-8 min-[1000px]:pb-18">
          {bandeauErreur ?? (
            <div
              className="grid justify-items-center gap-3 py-10 text-sm text-encre-doux"
              role="status"
            >
              <Roue />
              Chargement de la commande…
            </div>
          )}
        </Conteneur>
      </>
    );
  }

  const retrait = commande.type === "PICKUP";
  const annulee = commande.status === "CANCELLED";
  const servie = estServie(commande);
  const enCoursDeSuivi = !aPayer(commande) && !annulee;
  const points = pointsCredites(commande, pointsParFranc);
  const textePoints = textePointsCredites(points);
  const tranche = texteTranche(pointsParFranc);
  const restaurant = restaurantDeCommande(commande);
  const creneau = creneauRetrait(commande);
  const lieu = lieuCommande(commande);
  const payantes = commande.lignes.filter((l) => !l.offert);
  const cadeaux = [
    ...commande.lignes.filter((l) => l.offert).map((l) => l.nom),
    ...commande.lignes.flatMap((l) =>
      l.supplementsChoisis.filter((s) => s.offert).map((s) => joli(s.nom)),
    ),
  ];
  const carteAGratter = (
    <p>
      Une carte à gratter vous attend dans l&apos;application Chicken Nation.
      Connectez-vous avec le même numéro pour la découvrir.
    </p>
  );

  return (
    <>
      {entete}
      <Conteneur className="grid grid-cols-1 items-start gap-5 pt-6 pb-14 min-[1000px]:grid-cols-[minmax(0,1fr)_380px] min-[1000px]:gap-7 min-[1000px]:pt-8 min-[1000px]:pb-18">
        <div className="grid min-w-0 gap-4">
          {bandeauErreur}

          {justePaye ? (
            <section
              aria-labelledby="t-paye"
              className={cn(PANNEAU, "justify-items-center gap-3 text-center")}
            >
              <span className="grid size-16 place-items-center rounded-full bg-ok-fond text-ok">
                <Icone className="size-[34px]" nom="coche" />
              </span>
              <h2
                ref={titrePaye}
                className={TITRE_PANNEAU}
                id="t-paye"
                tabIndex={-1}
              >
                Paiement accepté
              </h2>
              <p className="text-sm text-encre-doux">
                {fcfa(commande.amount)} payés. Votre commande part en cuisine.
              </p>
              {textePoints ? (
                <div className="grid w-full justify-items-center gap-2.5 rounded-carte bg-jaune-pale px-3.5 py-3 text-[13.5px] leading-[1.45]">
                  <strong className="text-lg">{textePoints}</strong>
                  {carteAGratter}
                  <BadgesStores petits className="justify-center" />
                </div>
              ) : null}
              <Bouton
                bloc
                taille="grand"
                onClick={() => {
                  titreAvance.current?.focus();
                  titreAvance.current?.scrollIntoView({ block: "start" });
                }}
              >
                Suivre ma commande
              </Bouton>
            </section>
          ) : null}

          {aPayer(commande) ? (
            <section
              aria-labelledby="t-paiement"
              className={cn(PANNEAU, "border-2 border-orange")}
            >
              <h2 className={TITRE_PANNEAU} id="t-paiement">
                Paiement
              </h2>
              {etat === "confirmation" ? (
                <div className="flex items-center gap-3" role="status">
                  <Roue petite />
                  <p className="text-sm">
                    Paiement reçu par KKiaPay. Confirmation en cours, cela prend
                    quelques secondes…
                  </p>
                </div>
              ) : etat === "verification" ? (
                <>
                  <p className="font-semibold">
                    Un paiement est peut-être en cours de vérification. Ne payez
                    pas une seconde fois.
                  </p>
                  <p className="text-sm text-encre-doux">
                    Cette page se met à jour toute seule. En cas de doute,
                    appelez le <Numero /> et donnez la référence{" "}
                    <strong className="whitespace-nowrap text-encre">
                      {commande.reference}
                    </strong>
                    .
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-encre-doux">
                    Sur le site, la commande se paie en ligne. Elle part au
                    restaurant dès que le paiement est accepté. Tant
                    qu&apos;elle n&apos;est pas payée, vous pouvez la modifier.
                  </p>
                  {ecartPoints ? (
                    <p
                      className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm"
                      role="status"
                    >
                      {ecartPoints.accordee > 0
                        ? `Vos points donnent une remise de ${fcfa(ecartPoints.accordee)}, et non ${fcfa(ecartPoints.estimee)} comme estimé.`
                        : "Vos points n'ont pas pu être utilisés sur cette commande."}{" "}
                      Vous pouvez modifier votre commande avant de payer.
                    </p>
                  ) : null}
                  {etat === "commence" ? (
                    <p className="rounded-carte bg-jaune-pale px-3.5 py-3 text-sm">
                      Un paiement a déjà été commencé pour cette commande. Si
                      vous avez été débité, ne payez pas une seconde fois
                      {INSECABLE}: appelez le <Numero />.
                    </p>
                  ) : null}
                  {echec ? (
                    <p className="text-sm text-rouge" role="alert">
                      Le paiement n&apos;a pas abouti. Vous pouvez réessayer.
                    </p>
                  ) : null}
                  {!paiement ? (
                    <p className="text-sm text-rouge">
                      Le paiement en ligne est momentanément indisponible.
                    </p>
                  ) : null}
                  {erreurChargement ? (
                    <>
                      <p className="text-sm text-rouge" role="alert">
                        Le module de paiement n&apos;a pas pu se charger.
                      </p>
                      <Bouton
                        bloc
                        taille="grand"
                        variante="secondaire"
                        onClick={reessayer}
                      >
                        Réessayer
                      </Bouton>
                    </>
                  ) : (
                    <Bouton
                      bloc
                      disabled={!pret || !paiement || enCours === "modifier"}
                      icone="cadenas"
                      taille="grand"
                      onClick={payer}
                    >
                      {pret
                        ? `Payer ${fcfa(Math.ceil(commande.amount))}`
                        : "Préparation du paiement…"}
                    </Bouton>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <ConfirmationModifier
                      desactive={enCours !== null}
                      enCours={enCours === "modifier"}
                      erreur={erreurModif}
                      onConfirmer={async () => {
                        await modifier(commande);
                        // Annulée sans retour à la caisse : l'état est relu tout de suite.
                        relire();
                      }}
                    />
                  </div>
                </>
              )}
            </section>
          ) : null}

          {enCoursDeSuivi ? (
            <section aria-labelledby="t-avance" className={PANNEAU}>
              {/* L'état est déjà dans l'en-tête, sous la référence : pas de seconde pastille. */}
              <h2
                ref={titreAvance}
                className={TITRE_PANNEAU}
                id="t-avance"
                tabIndex={-1}
              >
                {servie
                  ? "Commande terminée"
                  : `Où en est votre commande${INSECABLE}?`}
              </h2>
              <FriseSuivi etapes={etapesFrise(commande)} />
            </section>
          ) : null}

          {/* Code donné par l'API seulement : rien n'est inventé (décision encore ouverte côté métier). */}
          {enCoursDeSuivi && !termine && commande.recovery_code ? (
            <section
              aria-labelledby="t-code"
              className={cn(
                PANNEAU,
                "gap-3 border-orange bg-orange-pale [background-image:var(--motif-nappe)] [background-size:72px_72px]",
              )}
            >
              <h2
                className={cn(TITRE_PANNEAU, "flex items-center gap-2")}
                id="t-code"
              >
                <Icone className="size-5" nom="cadenas" />
                Code de récupération
              </h2>
              <p
                aria-label={`Code ${commande.recovery_code.split("").join(" ")}`}
                className="flex flex-wrap gap-2.5"
                role="img"
              >
                {commande.recovery_code.split("").map((chiffre, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="grid h-[68px] w-[clamp(52px,16vw,64px)] place-items-center rounded-[14px] bg-white text-[32px] font-extrabold tabular-nums shadow-1"
                  >
                    {chiffre}
                  </span>
                ))}
              </p>
              <p className="text-[13.5px]">
                {retrait
                  ? "À donner au comptoir pour récupérer votre commande."
                  : `À donner au livreur au moment de la remise${INSECABLE}: c'est la preuve que la commande arrive à la bonne personne.`}
              </p>
            </section>
          ) : null}

          {textePoints && !justePaye ? (
            <section
              aria-labelledby="t-gain"
              className={cn(
                PANNEAU,
                "gap-3 border-jaune bg-jaune-pale [background-image:var(--motif-nappe)] [background-size:72px_72px]",
              )}
            >
              <h2 className={TITRE_PANNEAU} id="t-gain">
                Vos avantages
              </h2>
              <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <strong className="text-[26px] leading-[1.1] font-extrabold tabular-nums">
                  {textePoints}
                </strong>
                {tranche ? (
                  <span className="text-sm text-encre-doux">{tranche}</span>
                ) : null}
              </p>
              <div className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 text-sm">
                <span className="grid size-10 place-items-center rounded-full bg-orange text-encre">
                  <Icone className="size-6" nom="gratter" />
                </span>
                {carteAGratter}
              </div>
              <BadgesStores petits />
            </section>
          ) : null}

          {annulee ? (
            <section aria-labelledby="t-annulee" className={PANNEAU}>
              <h2 className={TITRE_PANNEAU} id="t-annulee">
                Commande annulée
              </h2>
              <p className="text-sm text-encre-doux">
                {commande.paied
                  ? "Cette commande a été annulée après son paiement."
                  : "Cette commande, non payée, a été annulée. Vous pouvez recommander les mêmes plats."}{" "}
                <AppelSite />
              </p>
            </section>
          ) : null}

          <section aria-labelledby="t-lieu" className={cn(PANNEAU, "gap-2")}>
            <h2 className={TITRE_PANNEAU} id="t-lieu">
              {retrait ? "Retrait" : "Livraison"}
            </h2>
            {retrait ? (
              <p className="text-[15px]">
                {restaurant ? (
                  <Lien
                    className="min-h-0 text-[15px] font-bold"
                    href={`/fr/restaurants/${restaurant.slug}`}
                  >
                    Chicken Nation {restaurant.nom}
                  </Lien>
                ) : (
                  <b>Restaurant</b>
                )}
                {restaurant?.adresse ? (
                  <span className="block text-[13px] text-encre-doux">
                    {restaurant.adresse}
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="text-[15px] [overflow-wrap:anywhere]">
                <b>{commande.adresse ?? "Adresse de livraison"}</b>
                {commande.repere ? (
                  <span className="block text-[13px] text-encre-doux">
                    Repère{INSECABLE}: {commande.repere}
                  </span>
                ) : null}
              </p>
            )}
            <p className="text-[13px] leading-[1.45] text-encre-doux">
              {retrait
                ? creneau
                  ? `${creneau}. `
                  : ""
                : restaurant
                  ? `Préparée au restaurant ${restaurant.nom}. `
                  : ""}
              <AppelSite />
            </p>
          </section>
        </div>

        <div className="grid min-w-0 content-start gap-3.5 min-[1000px]:sticky min-[1000px]:top-[calc(var(--h-entete)+20px)]">
          <RecapitulatifPhotos
            lieu={{ titre: lieu.titre, detail: lieu.detail }}
            lignes={lignesRecapDeCommande(commande)}
            titre="Récapitulatif"
            totaux={
              <Totaux
                cadeaux={cadeaux}
                fraisService={commande.tax}
                livraison={commande.delivery_fee}
                mode={retrait ? "PICKUP" : "DELIVERY"}
                nombreArticles={payantes.reduce((s, l) => s + l.quantite, 0)}
                remise={
                  commande.discount > 0
                    ? {
                        libelle:
                          commande.points > 0
                            ? `Points de fidélité (${pointsLisibles(commande.points)})`
                            : "Réduction",
                        montant: commande.discount,
                      }
                    : null
                }
                sousTotal={commande.net_amount}
                total={commande.amount}
              />
            }
          />
          <div className="flex flex-wrap gap-2">
            {peutRecommander(commande) ? (
              <BoutonRecommander
                commande={{
                  id: commande.id,
                  reference: commande.reference,
                  lignes: commande.lignes,
                }}
              />
            ) : null}
            <LienBouton
              href="/fr/commander/mes-commandes"
              variante="secondaire"
            >
              Mes commandes
            </LienBouton>
          </div>
        </div>
      </Conteneur>
    </>
  );
}
