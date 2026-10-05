"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import getQueryClient from "@/lib/get-query-client";

/**
 * TanStack Query, posé seulement autour des pages qui envoient une mutation
 * (adhésion à la Carte de la Nation, ouverture de l'appli). Un seul client par
 * montage : `cache` de React ne mémorise rien dans le navigateur.
 */
export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
