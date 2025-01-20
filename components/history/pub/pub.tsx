import { PlayCircle } from "lucide-react";
import Image from 'next/image';

export default function Pub() {
  return (
    <div className="relative w-full h-screen overflow-hidden rounded-2xl">
      {/* Background Pattern */}
      <Image
        className="absolute object-cover"
        src="/assets/images/illustrations/histoire/histoire-2.png"
        alt="title"
        fill
        priority
        sizes="100vw"
      />
      {/* Overlay */}
      <div className="bg-black/30 w-full h-full absolute inset-0"></div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
        {/* Play Icon */}
        <PlayCircle className="text-primary cursor-pointer" size={80} />
        
        {/* Title */}
        <h1 className="mt-6 text-4xl font-bold font-title underline">
          Découvrez Notre Histoire
        </h1>
        
        {/* Subtitle */}
        <p className="mt-2 text-xs font-light max-w-md underline cursor-pointer">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Recusandae similique doloremque debitis facere eum nemo voluptates sequi, culpa eius quam impedit dignissimos cum modi, ipsam in et accusantium. Aliquid, expedita!
        </p>
      </div>
    </div>
  );
}