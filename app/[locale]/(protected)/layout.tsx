import "@/styles/globals.css";

import Main from "@/components/primitives/Main";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Main>{children}</Main>;
}
