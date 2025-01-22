import React from 'react';
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Pattern */}
      <Image
        className="absolute inset-0 object-cover"
        src="/assets/images/backgrounds/background-histoire.png"
        alt="title"
        fill
        priority
        sizes="100vw"
        />
        <div className="bg-black/30 py-8 w-full absolute bottom-0 mx-auto">
        <div className="font-title text-primary text-center text-6xl mx-auto">
            HISTOIRE
        </div>
        </div>
    </div>
  );
};