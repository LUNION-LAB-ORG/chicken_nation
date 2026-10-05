import { cn } from "@/lib/utils";

/**
 * QR code vers /fr/app-mobile/deep-link (choix du store selon le téléphone).
 * SVG fixe de 2 ko : plus de génération dans le navigateur (qrcode, culori).
 * Inutile sur téléphone (on ne scanne pas son propre écran) : le parent le
 * masque sous 720 px.
 */
export function QrAppli({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt="QR code pour télécharger l'application Chicken Nation"
      className={cn(
        "block size-[140px] shrink-0 rounded-xl bg-white p-1.5 shadow-1",
        className,
      )}
      decoding="async"
      height={128}
      loading="lazy"
      src="/assets/site/qr-appli.svg"
      width={128}
    />
  );
}
