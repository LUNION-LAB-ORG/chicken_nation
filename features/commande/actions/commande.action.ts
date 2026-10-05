"use server";

import type {
  CadeauChoisi,
  IAdresseEnregistree,
  ICadeau,
  ICommande,
  IConditionsCommande,
  IConfigPaiement,
  ICreationCommande,
  IFideliteClient,
  IFraisLivraison,
  IItineraireLivraison,
  ILignePanier,
  ILivraisonDisponible,
  IPlatDetail,
  IReglagesFidelite,
  ISuggestionAdresse,
  Resultat,
} from "../types/commande.types";

import { appelApi } from "../apis/api-client.server";
import { versCommande } from "../utils/commande.utils";
import {
  articlesAvecCadeaux,
  erreurPoints,
  soldeUtilisable,
  versCadeau,
} from "../utils/fidelite.utils";
import {
  articlesPayants,
  assietteCodePromo,
  erreurLignesRecues,
  LIGNES_MAX,
  lignesACommander,
  platsNonProposes,
  problemesLigne,
  sousTotal,
} from "../utils/panier.utils";
import {
  IMAGE_PAR_DEFAUT,
  modesDeVente,
  versAdresseEnregistree,
  versConditionsCommande,
  versFrais,
  versItineraire,
  versPlatDetail,
  versReglagesFidelite,
} from "../utils/reponses-api.utils";

import { obtenirClientAction } from "./connexion.action";

import { formatImageUrl } from "@/utils/formatImageUrl";

type Brut = Record<string, unknown>;
const nombre = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const estUuid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);
const CONNEXION_REQUISE = "Connectez-vous pour continuer.";

/** Configuration publique de paiement jointe à une commande par le serveur (clé publique, jamais de secret). */
const versPaiement = (p: unknown): IConfigPaiement | null => {
  const x = p as Brut | undefined;

  return x?.public_key
    ? { public_key: String(x.public_key), sandbox: !!x.sandbox }
    : null;
};

// ── Carte ─────────────────────────────────────────────────────────────────

/** Détail d'un plat pour la fiche d'ajout au panier (route publique). */
export async function obtenirPlatAction(
  id: string,
): Promise<Resultat<IPlatDetail>> {
  if (!estUuid(id))
    return { ok: false, message: "Plat introuvable.", statut: 404 };
  const res = await appelApi<Brut>(`/dishes/${id}`, {
    public: true,
    entetes: { "x-app-composable": "1" },
  });

  if (!res.ok) return res;

  return { ok: true, data: versPlatDetail(res.data) };
}

/**
 * Plats du panier relus au catalogue, à l'ouverture de /commander : le panier
 * peut dater de plusieurs jours (prix, modes, créneaux ont pu changer, un plat
 * a pu être retiré). `null` = plat retiré du catalogue. Un plat absent du
 * résultat n'a pas pu être relu (réseau, serveur) : sa ligne reste telle quelle.
 */
export async function revaliderPanierAction(
  ids: string[],
): Promise<Record<string, IPlatDetail | null>> {
  // Identifiants de plats seulement, autant qu'un panier peut en avoir :
  // sinon un appel sans connexion déclenchait 40 lectures de l'API.
  const uniques = Array.from(
    new Set((Array.isArray(ids) ? ids : []).map(String).filter(estUuid)),
  ).slice(0, LIGNES_MAX);
  const resultats = await Promise.all(
    uniques.map(async (id) => [id, await obtenirPlatAction(id)] as const),
  );
  const plats: Record<string, IPlatDetail | null> = {};

  for (const [id, res] of resultats) {
    if (res.ok) plats[id] = res.data;
    else if (res.statut === 404) plats[id] = null;
  }

  return plats;
}

// ── Adresse et frais de livraison ─────────────────────────────────────────

/**
 * Livraison coupée depuis le back office (« delivery.app_disabled ») : le
 * serveur refuserait la commande au dernier moment. Si la route ne répond pas
 * (serveur pas encore à jour, réseau), la livraison est supposée ouverte : le
 * serveur reste le garde-fou.
 */
export async function livraisonDisponibleAction(): Promise<ILivraisonDisponible> {
  const res = await appelApi<Brut>("/orders/livraison-disponible", {
    public: true,
  });

  if (!res.ok || !res.data || res.data.disponible !== false)
    return { disponible: true, message: null };
  const message =
    typeof res.data.message === "string" ? res.data.message.trim() : "";

  return {
    disponible: false,
    message:
      message ||
      "La livraison est momentanément indisponible. Vous pouvez commander à emporter.",
  };
}

export async function rechercherAdressesAction(
  saisie: string,
  session: string,
): Promise<ISuggestionAdresse[]> {
  if (typeof saisie !== "string" || typeof session !== "string") return [];
  const q = saisie.trim();

  if (q.length < 3 || q.length > 120) return [];
  const params = new URLSearchParams({
    input: q,
    components: "country:ci",
    language: "fr",
    sessionToken: session,
  });
  const res = await appelApi<Brut[]>(`/maps/places/autocomplete?${params}`);

  if (!res.ok || !Array.isArray(res.data)) return [];

  return res.data.slice(0, 6).map((s) => ({
    placeId: String(s.placeId),
    principal: String(s.mainText ?? s.description ?? ""),
    secondaire: String(s.secondaryText ?? ""),
  }));
}

export async function detailsAdresseAction(
  placeId: string,
  session: string,
): Promise<Resultat<{ libelle: string; latitude: number; longitude: number }>> {
  if (typeof placeId !== "string" || typeof session !== "string" || !placeId)
    return { ok: false, message: "Adresse introuvable." };
  const res = await appelApi<Brut>(
    `/maps/places/details/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(session)}`,
  );

  if (!res.ok) return res;
  const lat = nombre(res.data.latitude);
  const lng = nombre(res.data.longitude);

  if (!lat || !lng)
    return {
      ok: false,
      message: "Adresse introuvable. Essayez une autre recherche.",
    };
  const nom = String(res.data.name ?? "");
  const adresse = String(res.data.formattedAddress ?? "");

  return {
    ok: true,
    data: {
      libelle: adresse.startsWith(nom) ? adresse : `${nom}, ${adresse}`,
      latitude: lat,
      longitude: lng,
    },
  };
}

export async function adresseDepuisPositionAction(
  latitude: number,
  longitude: number,
): Promise<Resultat<{ libelle: string; latitude: number; longitude: number }>> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
    return { ok: false, message: "Position invalide." };
  const res = await appelApi<Brut>(
    `/maps/geocode/reverse?lat=${latitude}&lng=${longitude}`,
  );
  const libelle = res.ok
    ? String(
        res.data.formattedAddress ??
          res.data.formatted_address ??
          res.data.address ??
          "",
      )
    : "";

  return {
    ok: true,
    data: { libelle: libelle || "Ma position actuelle", latitude, longitude },
  };
}

export async function calculerFraisAction(
  latitude: number,
  longitude: number,
  montantPanier: number,
): Promise<Resultat<IFraisLivraison>> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
    return { ok: false, message: "Position invalide." };
  const params = new URLSearchParams({
    lat: String(latitude),
    long: String(longitude),
    order_amount: String(Math.max(0, Math.round(Number(montantPanier) || 0))),
  });
  const res = await appelApi<Brut>(`/orders/frais-livraison?${params}`, {
    public: true,
  });

  if (!res.ok) return res;

  return versFrais(res.data);
}

/**
 * Restaurant qui préparera la livraison et frais pour cette adresse
 * (« Préparée au restaurant X, à N km »), en un seul appel. C'est le serveur
 * qui choisit le restaurant ; il peut changer à la commande si un plat y est
 * exclu. ⚠️ La route demande aussi le trajet à Google (facturé, gardé un
 * moment en cache par le serveur) : à appeler une fois par adresse choisie,
 * calculerFraisAction suffit quand seul le montant du panier change.
 */
export async function itineraireLivraisonAction(
  latitude: number,
  longitude: number,
  montantPanier: number,
): Promise<Resultat<IItineraireLivraison>> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
    return { ok: false, message: "Position invalide." };
  const params = new URLSearchParams({
    lat: String(latitude),
    long: String(longitude),
    order_amount: String(Math.max(0, Math.round(Number(montantPanier) || 0))),
  });
  const res = await appelApi<Brut>(`/orders/itineraire-livraison?${params}`, {
    public: true,
  });

  if (!res.ok) return res;

  return versItineraire(res.data);
}

// ── Adresses enregistrées (carnet partagé avec l'application) ─────────────

/** Ce que le client saisit d'une adresse à enregistrer (titre, texte et point GPS). */
type IChampsAdresse = Omit<IAdresseEnregistree, "id">;

/**
 * Champs d'une adresse remis sous la forme de l'API, ou message d'erreur.
 * Une action serveur s'appelle avec n'importe quels arguments : tout est
 * revérifié ici. `partiel` : seuls les champs donnés sont contrôlés (PATCH).
 */
function corpsAdresse(
  a: Partial<IChampsAdresse>,
  partiel: boolean,
): Resultat<Brut> {
  const corps: Brut = {};

  if (!partiel || a.titre !== undefined) {
    const titre = String(a.titre ?? "")
      .replace(/\s+/g, " ")
      .trim();

    if (titre.length > 40)
      return {
        ok: false,
        message: "Nom de l'adresse trop long (40 caractères au plus).",
      };
    corps.title = titre || "Adresse";
  }
  if (!partiel || a.libelle !== undefined) {
    const libelle = String(a.libelle ?? "")
      .replace(/\s+/g, " ")
      .trim();

    if (libelle.length < 3 || libelle.length > 300)
      return { ok: false, message: "Adresse invalide." };
    corps.address = libelle;
  }
  if (!partiel || a.latitude !== undefined || a.longitude !== undefined) {
    const lat = Number(a.latitude);
    const lng = Number(a.longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 90 ||
      Math.abs(lng) > 180 ||
      (!lat && !lng)
    ) {
      return { ok: false, message: "Position de l'adresse invalide." };
    }
    corps.latitude = lat;
    corps.longitude = lng;
  }

  return { ok: true, data: corps };
}

/** Adresses enregistrées du client connecté, les plus récentes d'abord. */
export async function listerAdressesAction(): Promise<
  Resultat<IAdresseEnregistree[]>
> {
  const client = await obtenirClientAction();

  if (!client) return { ok: false, message: CONNEXION_REQUISE };
  // Le serveur lit le client dans le jeton ; l'identifiant de l'adresse ne sert qu'à la forme de la route.
  const res = await appelApi<Brut[]>(
    `/addresses/customer/${encodeURIComponent(client.id)}`,
  );

  if (!res.ok) return res;
  const adresses = (Array.isArray(res.data) ? res.data : [])
    .map(versAdresseEnregistree)
    .filter((a): a is IAdresseEnregistree => a !== null)
    .slice(0, 20);

  return { ok: true, data: adresses };
}

/** Enregistre une adresse dans le carnet du client (le repère reste propre à la commande). */
export async function enregistrerAdresseAction(
  a: IChampsAdresse,
): Promise<Resultat<IAdresseEnregistree>> {
  const corps = corpsAdresse(a ?? {}, false);

  if (!corps.ok) return corps;
  const res = await appelApi<Brut>("/addresses", {
    methode: "POST",
    corps: corps.data,
  });

  if (!res.ok) return res;
  const adresse = versAdresseEnregistree(res.data);

  return adresse
    ? { ok: true, data: adresse }
    : {
        ok: false,
        message: "Adresse enregistrée, mais illisible. Rechargez la page.",
      };
}

/** Renomme ou déplace une adresse du client ; le serveur refuse celle d'un autre. */
export async function modifierAdresseAction(
  id: string,
  champs: Partial<IChampsAdresse>,
): Promise<Resultat<IAdresseEnregistree>> {
  if (!estUuid(String(id)))
    return { ok: false, message: "Adresse introuvable." };
  const corps = corpsAdresse(champs ?? {}, true);

  if (!corps.ok) return corps;
  if (Object.keys(corps.data).length === 0)
    return { ok: false, message: "Rien à modifier." };
  const res = await appelApi<Brut>(`/addresses/${id}`, {
    methode: "PATCH",
    corps: corps.data,
  });

  if (!res.ok) return res;
  // La réponse embarque la fiche du client : seuls les champs de l'adresse sont repris.
  const adresse = versAdresseEnregistree(res.data);

  return adresse
    ? { ok: true, data: adresse }
    : {
        ok: false,
        message: "Adresse modifiée, mais illisible. Rechargez la page.",
      };
}

/** Retire une adresse du carnet du client ; le serveur refuse celle d'un autre. */
export async function supprimerAdresseAction(
  id: string,
): Promise<Resultat<null>> {
  if (!estUuid(String(id)))
    return { ok: false, message: "Adresse introuvable." };
  const res = await appelApi<Brut>(`/addresses/${id}`, { methode: "DELETE" });

  return res.ok ? { ok: true, data: null } : res;
}

// ── Conditions de la commande ─────────────────────────────────────────────

/**
 * Taux des frais de service et grille de livraison (route publique du lot
 * L4). Serveur plus ancien, réseau ou réponse illisible : tout à null, et le
 * site écrit « calculés au paiement ». La grille n'est donnée que si elle
 * s'applique vraiment (grille_frais_appliquee).
 */
export async function lireConditionsCommandeAction(): Promise<IConditionsCommande> {
  const res = await appelApi<Brut>("/orders/conditions-commande", {
    public: true,
  });

  return versConditionsCommande(res.ok ? res.data : null);
}

// ── Code promo ou bon ─────────────────────────────────────────────────────

export async function verifierCodeReductionAction(
  code: string,
  lignes: ILignePanier[],
  montantPanier: number,
): Promise<Resultat<{ code: string; remise: number }>> {
  // Une action serveur s'appelle avec n'importe quels arguments : on filtre.
  if (typeof code !== "string" || !Array.isArray(lignes))
    return { ok: false, message: "Code invalide." };
  const c = code.trim().toUpperCase();

  if (!/^[A-Z0-9_-]{3,40}$/.test(c))
    return { ok: false, message: "Code invalide." };
  if (!Number.isFinite(montantPanier) || montantPanier < 0)
    return { ok: false, message: "Code invalide." };
  const promo = await appelApi<Brut>("/promo-code/apply", {
    methode: "POST",
    corps: {
      code: c,
      order_amount: Math.round(montantPanier),
      order_items: assietteCodePromo(lignes),
    },
  });

  if (promo.ok && promo.data.isValid) {
    return {
      ok: true,
      data: {
        code: c,
        remise: Math.min(nombre(promo.data.discountAmount), montantPanier),
      },
    };
  }
  // Pas un code promo : peut-être un bon d'achat.
  const bon = await appelApi<Brut>(
    `/voucher/client/check/${encodeURIComponent(c)}`,
  );

  if (bon.ok && bon.data.isValid) {
    return {
      ok: true,
      data: {
        code: c,
        remise: Math.min(nombre(bon.data.remainingAmount), montantPanier),
      },
    };
  }
  const message = !promo.ok
    ? promo.message
    : (promo.data.message as string) ||
      "Ce code n'est pas valable pour ce panier.";

  return { ok: false, message };
}

// ── Fidélité : points et cadeaux ──────────────────────────────────────────

/** Réglages de fidélité (route publique), lus à chaque fois : le back office peut les changer. */
async function lireReglagesFidelite(): Promise<Resultat<IReglagesFidelite>> {
  const res = await appelApi<Brut>("/fidelity/loyalty/config", {
    public: true,
  });

  if (!res.ok) return res;

  return { ok: true, data: versReglagesFidelite(res.data) };
}

/**
 * Réglages de fidélité lisibles SANS connexion : « Cette commande vous
 * rapportera N points » (fidelite.utils, textePointsGagnes) dans le panier
 * d'un visiteur, et la durée de validité des points. En cas d'échec, rien
 * n'est affiché : aucun chiffre de fidélité n'est écrit en dur.
 */
export async function lireReglagesFideliteAction(): Promise<
  Resultat<IReglagesFidelite>
> {
  return lireReglagesFidelite();
}

/**
 * Cadeau complété par son article relu au catalogue : le serveur contrôle le
 * plat ou le supplément offert comme un autre (mode, créneau, restaurant) et
 * refuserait la commande ENTIÈRE. Relecture impossible (réseau) : cadeau
 * laissé tel quel, le serveur reste le garde-fou.
 */
async function completerCadeau(c: ICadeau): Promise<ICadeau> {
  const image = c.image
    ? formatImageUrl(c.image, IMAGE_PAR_DEFAUT)
    : IMAGE_PAR_DEFAUT;

  if (c.type === "PLAT") {
    const plat = await obtenirPlatAction(c.articleId);

    if (!plat.ok)
      return {
        ...c,
        image,
        ...(plat.statut === 404 ? { indisponible: true } : {}),
      };

    return {
      ...c,
      image: c.image ? image : plat.data.image,
      available_order_types: plat.data.available_order_types,
      available_from: plat.data.available_from,
      available_until: plat.data.available_until,
      restaurantsExclus: plat.data.restaurantsExclus,
    };
  }
  const supplement = await appelApi<Brut>(`/supplements/${c.articleId}`, {
    public: true,
  });

  if (!supplement.ok)
    return {
      ...c,
      image,
      ...(supplement.statut === 404 ? { indisponible: true } : {}),
    };
  // Réponse vide : rien à contrôler, plutôt que de faire échouer toute la lecture.
  const s = supplement.data ?? {};

  return {
    ...c,
    image,
    available_order_types: modesDeVente(s.available_order_types),
    ...(s.available === false ? { indisponible: true } : {}),
  };
}

/**
 * Points et cadeaux du client connecté, pour le panier. Son identifiant est
 * relu ici avec le jeton, jamais reçu du navigateur. Chaque partie peut
 * manquer sans l'autre : la commande reste possible sans elles.
 */
export async function lireFideliteAction(): Promise<Resultat<IFideliteClient>> {
  const client = await obtenirClientAction();

  if (!client) return { ok: false, message: CONNEXION_REQUISE };
  const [reglages, compte, gagnes] = await Promise.all([
    lireReglagesFidelite(),
    appelApi<Brut>(
      `/fidelity/loyalty/customer/${encodeURIComponent(client.id)}`,
    ),
    appelApi<Brut[]>("/fidelity/rewards/redeemable-gifts"),
  ]);
  const points =
    reglages.ok && compte.ok
      ? { ...reglages.data, solde: soldeUtilisable(compte.data) }
      : null;

  if (!points && !gagnes.ok) return gagnes;
  const cadeaux = (gagnes.ok && Array.isArray(gagnes.data) ? gagnes.data : [])
    .map(versCadeau)
    .filter((x): x is ICadeau => x !== null)
    .slice(0, 10);

  return {
    ok: true,
    data: { points, cadeaux: await Promise.all(cadeaux.map(completerCadeau)) },
  };
}

// ── Commande ──────────────────────────────────────────────────────────────

/**
 * `remise` : remise accordée par le serveur (code ou points). Le panier la
 * compare à son estimation pour prévenir le client avant le paiement.
 * `montant` et `paiement` : total à débiter et clé publique KKiaPay renvoyés
 * par le serveur, pour ouvrir le paiement sans relire la commande (étape 5).
 */
export async function creerCommandeAction(c: ICreationCommande): Promise<
  Resultat<{
    id: string;
    reference: string;
    montant: number;
    remise: number;
    paiement: IConfigPaiement | null;
  }>
> {
  // Une action serveur s'appelle avec n'importe quels arguments : forme et
  // quantités contrôlées avant tout (le serveur ne refuse pas une quantité
  // de supplément de 0,01 ou de −3, qui baisserait le prix de la commande).
  if (!c || typeof c !== "object")
    return { ok: false, message: "Votre panier est vide." };
  const erreurLignes = erreurLignesRecues(c.lignes);

  if (erreurLignes) return { ok: false, message: erreurLignes };
  if (c.mode !== "DELIVERY" && c.mode !== "PICKUP")
    return { ok: false, message: "Choisissez la livraison ou le retrait." };
  if (
    c.mode === "DELIVERY" &&
    c.adresse &&
    (!Number.isFinite(c.adresse.latitude) ||
      !Number.isFinite(c.adresse.longitude) ||
      typeof c.adresse.libelle !== "string" ||
      typeof c.adresse.repere !== "string")
  )
    return { ok: false, message: "Choisissez l'adresse de livraison." };
  if (c.mode === "PICKUP" && c.restaurantId && !estUuid(String(c.restaurantId)))
    return { ok: false, message: "Choisissez le restaurant de retrait." };
  if (
    c.heureRetrait !== null &&
    c.heureRetrait !== undefined &&
    (typeof c.heureRetrait !== "string" ||
      Number.isNaN(Date.parse(c.heureRetrait)))
  )
    return { ok: false, message: "Choisissez une heure de retrait." };
  if (c.code !== null && c.code !== undefined && typeof c.code !== "string")
    return { ok: false, message: "Code invalide." };
  const lignes = lignesACommander(c.lignes);

  if (lignes.length === 0)
    return { ok: false, message: "Votre panier est vide." };

  // Une action serveur s'appelle avec n'importe quels arguments : on filtre.
  const points =
    Number.isInteger(c.points) && (c.points as number) > 0
      ? (c.points as number)
      : 0;
  const cadeaux: CadeauChoisi[] = (Array.isArray(c.cadeaux) ? c.cadeaux : [])
    .filter(
      (x) =>
        !!x &&
        estUuid(String(x.id)) &&
        estUuid(String(x.articleId)) &&
        (x.type === "PLAT" || x.type === "SUPPLEMENT"),
    )
    .slice(0, 10)
    .map((x) => ({
      id: x.id,
      type: x.type,
      articleId: x.articleId,
      nom: String(x.nom ?? "").slice(0, 80),
      ...(typeof x.epice === "boolean" ? { epice: x.epice } : {}),
    }));

  // RG-02 : points OU code, jamais les deux (le serveur refuserait aussi).
  if (points > 0 && c.code) {
    return {
      ok: false,
      message:
        "Les points et un code ne se cumulent pas. Retirez l'un des deux.",
    };
  }
  if (c.mode === "DELIVERY" && !c.adresse)
    return { ok: false, message: "Choisissez l'adresse de livraison." };
  if (c.mode === "PICKUP" && !c.restaurantId)
    return { ok: false, message: "Choisissez le restaurant de retrait." };
  const maintenant = new Date();

  for (const l of lignes) {
    const probleme = problemesLigne(l, c.mode, maintenant)[0];

    if (probleme) return { ok: false, message: `« ${l.nom} » : ${probleme}` };
  }
  if (c.mode === "PICKUP" && c.restaurantId) {
    const absents = platsNonProposes(lignes, c.restaurantId);

    if (absents.length) {
      return {
        ok: false,
        message: `Ce restaurant ne propose pas : ${absents.join(", ")}. Choisissez-en un autre.`,
      };
    }
  }

  /**
   * Nom, téléphone et courriel relus ICI, depuis le compte du client, et non
   * reçus du navigateur. Un client connecté sans prénom ni nom (code validé,
   * puis page rechargée avant l'étape du nom) partait sinon au nom de
   * « null null », vu par la caisse, le livreur et Turbo.
   */
  const client = await obtenirClientAction();

  if (!client) return { ok: false, message: CONNEXION_REQUISE };
  if (!client.first_name || !client.last_name) {
    return {
      ok: false,
      message: "Indiquez votre prénom et votre nom avant de commander.",
    };
  }

  /**
   * Plafond des points revérifié avec les réglages du moment (le panier a pu
   * les lire il y a longtemps). Le serveur enregistre les points DEMANDÉS et
   * les déduit tous au paiement, même quand il plafonne la remise : en
   * envoyer plus que le plafond n'en couvre ferait perdre des points au
   * client. Le solde, lui, est contrôlé par le serveur.
   */
  if (points > 0) {
    const reglages = await lireReglagesFidelite();

    if (!reglages.ok) return reglages;
    const erreur = erreurPoints(
      points,
      { ...reglages.data, solde: points },
      sousTotal(lignes),
    );

    if (erreur)
      return {
        ok: false,
        message: `${erreur} Modifiez vos points puis réessayez.`,
      };
  }

  // Cadeaux placés comme dans l'application (cf. articlesAvecCadeaux).
  const { articles, nonPlaces } = articlesAvecCadeaux(
    articlesPayants(lignes),
    cadeaux,
  );

  if (nonPlaces.length) {
    return {
      ok: false,
      message: `« ${nonPlaces[0].nom} » : chaque plat du panier a déjà ce supplément. Retirez le cadeau ou ajoutez un plat.`,
    };
  }

  const corps = {
    type: c.mode,
    ...(c.mode === "PICKUP" ? { restaurant_id: c.restaurantId } : {}),
    items: articles,
    phone: client.phone,
    fullname: `${client.first_name} ${client.last_name}`,
    ...(client.email ? { email: client.email } : {}),
    ...(c.mode === "DELIVERY" && c.adresse
      ? {
          address: JSON.stringify({
            title: "Livraison",
            address: c.adresse.libelle,
            city: "Abidjan",
            latitude: c.adresse.latitude,
            longitude: c.adresse.longitude,
            note: c.adresse.repere.trim().slice(0, 200),
          }),
        }
      : {}),
    payment_method: "ONLINE",
    date: c.heureRetrait ?? new Date().toISOString(),
    ...(c.code ? { code_promo: c.code } : {}),
    ...(points > 0 ? { points } : {}),
  };

  const res = await appelApi<Brut>("/orders/create-v2", {
    methode: "POST",
    corps,
    entetes: { "x-canal-commande": "web" },
  });

  if (!res.ok) return res;

  return {
    ok: true,
    data: {
      id: String(res.data.id),
      reference: String(res.data.reference ?? ""),
      montant: nombre(res.data.amount),
      remise: nombre(res.data.discount),
      paiement: versPaiement(res.data.payment),
    },
  };
}

/**
 * Annulation par le client d'une commande pas encore payée, pour la modifier.
 * Le serveur rend le bon d'achat ou le code promo engagé et les cadeaux
 * (reward.service, restoreConsumedGiftsForOrder), et range le panier annulé
 * dans « À relancer » pour le centre d'appels. Les points, eux, ne sont
 * jamais déduits d'une commande non payée : rien à rendre.
 */
export async function annulerCommandeAction(
  id: string,
): Promise<Resultat<null>> {
  if (!estUuid(id)) return { ok: false, message: "Commande introuvable." };
  // Relue juste avant : une commande payée entre-temps ne s'annule pas d'ici
  // (l'annulation déclencherait un remboursement).
  const actuelle = await appelApi<Brut>(`/orders/${id}/client`);

  if (!actuelle.ok) return actuelle;
  if (actuelle.data.paied || actuelle.data.status !== "PENDING") {
    return {
      ok: false,
      message:
        "Cette commande est déjà payée ou en cours : elle ne peut plus être modifiée.",
    };
  }
  const res = await appelApi<Brut>(`/orders/${id}/client/status`, {
    methode: "PATCH",
    corps: {
      status: "CANCELLED",
      meta: { reason: "Modification de la commande depuis le site" },
    },
  });

  return res.ok ? { ok: true, data: null } : res;
}

export async function obtenirCommandeAction(
  id: string,
): Promise<
  Resultat<{ commande: ICommande; paiement: IConfigPaiement | null }>
> {
  if (!estUuid(id))
    return { ok: false, message: "Commande introuvable.", statut: 404 };
  const res = await appelApi<Brut>(`/orders/${id}/client`);

  if (!res.ok) return res;

  return {
    ok: true,
    data: {
      commande: versCommande(res.data),
      paiement: versPaiement(res.data.payment),
    },
  };
}

export async function listerCommandesAction(): Promise<Resultat<ICommande[]>> {
  const res = await appelApi<Brut | Brut[]>("/orders/customer?page=1&limit=20");

  if (!res.ok) return res;
  const liste = Array.isArray(res.data)
    ? res.data
    : ((res.data.data as Brut[]) ?? []);

  return { ok: true, data: liste.map(versCommande) };
}
