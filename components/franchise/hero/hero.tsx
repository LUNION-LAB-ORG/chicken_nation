import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative w-full h-[calc(100vh-70px)] overflow-hidden">
      {/* Background Pattern */}
      <Image
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/images/backgrounds/bg-franchise.png"
        alt="title"
        layout="fill" 
        objectFit="cover" 
      />
      <div className="bg-black/30 py-8 w-full absolute bottom-0 mx-auto">
        <div className="font-title text-primary text-center text-6xl mx-auto">
          FRANCHISE
        </div>
      </div>
    </div>
  );
}
