import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative w-full h-[calc(100vh-70px)] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/backgrounds/faq.png"
          alt="title"
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="bg-black/30 py-8 w-full absolute bottom-0 mx-auto">
        <div className="font-title text-primary text-center text-3xl md:text-6xl mx-auto flex justify-center gap-4">
            FAQ
        </div>
      </div>
    </div>
  );
}
