"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { CheckCircle2, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { nomCourt } from "@/features/restaurants/restaurant.utils";
import { obtenirCommandeAction } from "../actions/commande.action";
import { useKkiapay } from "../hooks/useKkiapay";
import type { IClient, ICommande, IConfigPaiement } from "../types/commande.types";
import { fcfa, telephoneLisible } from "../utils/panier.utils";
import { aPayer, couleurStatut, etapesSuivi, libelleStatut } from "../utils/statut.utils";

export default function SuiviCommande({
  id,
  client,
  ouvrirPaiement,
}: {
  id: string;
  client: IClient;
  ouvrirPaiement: boolean;
}) {
  const [commande, setCommande] = useState<ICommande | null>(null);
  const [paiement, setPaiement] = useState<IConfigPaiement | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  // Entre le succès annoncé par KKiaPay et la confirmation du serveur (webhook).
  const [confirmation, setConfirmation] = useState(false);
  const [echec, setEchec] = useState(false);
  const dejaOuvert = useRef(false);

  const relire = useCallback(async () => {
    const res = await obtenirCommandeAction(id);
    if (!res.ok) return setErreur(res.message);
    setErreur(null);
    setCommande(res.data.commande);
    setPaiement(res.data.paiement);
    if (res.data.commande.paied) setConfirmation(false);
  }, [id]);

  // Relecture régulière : plus rapide pendant la confirmation du paiement.
  useEffect(() => {
    relire();
    const t = setInterval(relire, confirmation ? 4000 : 15000);
    return () => clearInterval(t);
  }, [relire, confirmation]);

  const { pret, ouvrir } = useKkiapay({
    onSucces: () => {
      setEchec(false);
      setConfirmation(true);
      relire();
    },
    onEchec: () => {
      setEchec(true);
      relire();
    },
  });

  const payer = useCallback(() => {
    if (!commande || !paiement) return;
    setEchec(false);
    ouvrir({
      amount: Math.ceil(commande.amount),
      key: paiement.public_key,
      sandbox: paiement.sandbox,
      phone: client.phone.replace(/^\+225/, ""),
      name: [client.first_name, client.last_name].filter(Boolean).join(" "),
      ...(client.email ? { email: client.email } : {}),
      reason: `Règlement Commande ${commande.reference}`,
      data: commande.reference,
    });
  }, [commande, paiement, client, ouvrir]);

  // Arrivée depuis le panier : le module de paiement s'ouvre une fois.
  // Le module KKiaPay prépare sa fenêtre juste après son chargement : un appel
  // immédiat est ignoré, d'où le délai. Il n'est pas annulé quand la commande
  // est relue entre-temps (la dernière version de `payer` est lue au moment
  // voulu). Le bouton « Payer » reste là en secours.
  const payerRef = useRef(payer);
  payerRef.current = payer;
  const peutOuvrir = ouvrirPaiement && pret && !!commande && !!paiement && aPayer(commande);
  useEffect(() => {
    if (!peutOuvrir || dejaOuvert.current) return;
    dejaOuvert.current = true;
    setTimeout(() => payerRef.current(), 1200);
  }, [peutOuvrir]);

  if (!commande) {
    return (
      <div className="flex justify-center py-20">
        {erreur ? <p className="text-gray-700">{erreur}</p> : <Spinner color="primary" />}
      </div>
    );
  }

  const etapes = etapesSuivi(commande.type);
  const indexCourant = etapes.findIndex((e) => e.statuts.includes(commande.status));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
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
          {confirmation ? (
            <div className="flex items-center gap-3">
              <Spinner size="sm" color="primary" />
              <p className="text-sm">Paiement reçu par KKiaPay. Confirmation en cours, cela prend quelques secondes…</p>
            </div>
          ) : (
            <>
              <p className="font-semibold">Votre commande sera envoyée au restaurant dès le paiement.</p>
              {echec && <p role="alert" className="text-sm text-danger">Le paiement n&apos;a pas abouti. Vous pouvez réessayer.</p>}
              {!paiement && <p className="text-sm text-danger">Le paiement en ligne est momentanément indisponible.</p>}
              <Button color="primary" size="lg" className="font-semibold" isDisabled={!pret || !paiement} onPress={payer}>
                {pret ? `Payer ${fcfa(Math.ceil(commande.amount))}` : "Chargement du paiement…"}
              </Button>
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
        <ul className="flex flex-col gap-1 text-sm">
          {commande.lignes.map((l, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>
                {l.quantite} × {l.nom}
              </span>
              <span>{fcfa(l.montant)}</span>
            </li>
          ))}
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

      {commande.restaurant?.phone && (
        <a href={`tel:+225${commande.restaurant.phone.replace(/\D/g, "").replace(/^225/, "")}`} className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
          <Phone size={16} /> Une question ? Appelez le restaurant au {telephoneLisible(commande.restaurant.phone)}
        </a>
      )}
      <Link href="/commander/mes-commandes" className="text-center text-sm text-primary underline">
        Toutes mes commandes
      </Link>
    </div>
  );
}
