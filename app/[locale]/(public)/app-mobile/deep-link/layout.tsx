import type { Metadata } from "next";

// Page technique d'ouverture de l'application : rien à indexer.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DeepLinkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
