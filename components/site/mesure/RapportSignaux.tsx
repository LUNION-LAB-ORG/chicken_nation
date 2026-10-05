"use client";

import { useReportWebVitals } from "next/web-vitals";

import { evenementGA } from "@/lib/analytique";

type Signal = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

// Fonction stable : le crochet ne se réabonne pas à chaque rendu.
function envoyer(signal: Signal) {
  evenementGA(signal.name, {
    // GA4 attend des entiers : le CLS est multiplié par 1 000.
    value: Math.round(
      signal.name === "CLS" ? signal.value * 1000 : signal.value,
    ),
    metric_id: signal.id,
    metric_value: signal.value,
    metric_delta: signal.delta,
    metric_rating: "rating" in signal ? signal.rating : undefined,
    non_interaction: true,
  });
}

/** Chargé à la demande par MesureSignaux. */
export default function RapportSignaux() {
  useReportWebVitals(envoyer);

  return null;
}
