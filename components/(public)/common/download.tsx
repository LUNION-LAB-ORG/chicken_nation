"use client";

import Image from "next/image";
import { Apple, Play } from "lucide-react";
import { Button } from "@heroui/button";
import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";
import Link from "next/link";

export default function Download() {
  return (
    <Section padding="none" className="bg-[#fcd424] relative overflow-hidden">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col justify-center items-center md:items-start p-4">
          <Motion variant="verticalSlideIn">
            <h2 className="font-title text-2xl sm:text-3xl md:text-5xl text-center md:text-left font-semibold leading-tight">
              Pour commander appelez-nous au <br />
              <span className="text-primary-200">0720353535 / 0747000034</span>
            </h2>
          </Motion>

          <Motion variant="verticalSlideIn">
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-8">
              <Button
                startContent={<Play size={20} />}
                radius="lg"
                size="lg"
                as={Link}
                target="_blank"
                href="https://play.google.com/store/apps/details?id=com.chickennation.app"
                className="bg-primary text-white text-sm sm:text-base shadow-md hover:scale-105 transition-transform"
              >
                Google Play
              </Button>

              <Button
                startContent={<Apple size={20} />}
                radius="lg"
                size="lg"
                as={Link}
                target="_blank"
                href="https://apps.apple.com/ci/app/chicken-nation/id6745905607"
                className="bg-black text-white text-sm sm:text-base shadow-md hover:scale-105 transition-transform"
              >
                App Store
              </Button>
            </div>
          </Motion>
        </div>
        <div className="relative">
          <Image
            src="/assets/images/backgrounds/Section.png"
            alt="Download App"
            width={1869}
            height={1278}
            className="object-cover"
            priority
          />
        </div>
      </div>
    </Section>
  );
}
