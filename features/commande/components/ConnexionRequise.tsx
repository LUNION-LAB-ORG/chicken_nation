"use client";

import { useRouter } from "@/i18n/navigation";
import Connexion from "./Connexion";

/** Affiche la connexion, puis recharge la page une fois le client connecté. */
export default function ConnexionRequise() {
  const router = useRouter();
  return <Connexion onConnecte={() => router.refresh()} />;
}
