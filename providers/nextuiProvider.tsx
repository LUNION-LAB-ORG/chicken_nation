import { HeroUIProvider } from "@heroui/react";

export function NextuiProvider({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
