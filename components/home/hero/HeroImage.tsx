
import Image from "next/image";
import React from "react";

type Props = {
  src: string;
};

export default function HeroImage({ src }: Props) {

  return (
    <Image
      src={src}
      fill
      alt="hero_image"
      objectFit="cover"
      className="object-cover object-top"
    />
  );
}
