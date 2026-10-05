import { ToastProvider } from "@heroui/toast";

// Notifications HeroUI de la commande, provisoires : remplacées par
// MessageFlottant au lot L11.
export default function CommanderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToastProvider
        placement="top-center"
        toastProps={{ shouldShowTimeoutProgress: true }}
      />
      {children}
    </>
  );
}
