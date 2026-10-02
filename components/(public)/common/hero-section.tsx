import Title from "@/components/primitives/Title";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface HeroSectionProps {
  title: string;
  src: string;
  type?: "image" | "video";
  /** Bannière basse (environ 40 % de l'écran) : la page Menus montre ses plats sans défiler. */
  compact?: boolean;
  /** Phrase sous le titre, en police normale (la police des titres n'a pas d'accents). */
  sousTitre?: string;
}

export default function HeroSection({
  title,
  src,
  type = "image",
  compact = false,
  sousTitre,
}: HeroSectionProps) {
  const isVideo = type === "video";

  return (
    <div
      className={cn(
        "relative w-full bg-primary overflow-hidden",
        compact
          ? "h-[40vh] min-h-[280px] max-h-[420px]"
          : "h-[calc(100vh-70px)] min-h-[600px] max-h-[900px]"
      )}
    >
      {isVideo ? (
        <video
          className="w-full h-full object-cover"
          src={src}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <Image
          src={src}
          alt={title}
          fill
          className="w-full h-full object-cover"
        />
      )}

      <div
        className={cn(
          "bg-black/60 w-full absolute bottom-0 mx-auto flex justify-center items-center",
          compact ? "p-4 md:p-6" : "p-8",
          sousTitre && "flex-col gap-2"
        )}
      >
        <Title level={1} size="lg" color="secondary" className="text-center">
          {title}
        </Title>
        {sousTitre && (
          <p className="text-center text-white text-sm md:text-base">{sousTitre}</p>
        )}
      </div>
    </div>
  );
}
