import Title from "@/components/primitives/Title";
import Image from "next/image";

interface HeroSectionProps {
  title: string;
  src: string;
  type?: "image" | "video";
}

export default function HeroSection({
  title,
  src,
  type = "image",
}: HeroSectionProps) {
  const isVideo = type === "video";

  return (
    <div className="relative w-full bg-primary h-[calc(100vh-70px)] min-h-[600px] max-h-[900px] overflow-hidden">
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

      <div className="bg-black/60 p-8 w-full absolute bottom-0 mx-auto flex justify-center items-center">
        <Title level={1} size="lg" color="white" className="text-center">
          {title}
        </Title>
      </div>
    </div>
  );
}
