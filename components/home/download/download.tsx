import Image from "next/image"
import { Apple, Play } from "lucide-react";
import { Button } from "@heroui/react";
import Motion from "@/lib/motion";

export default function Download(){
    return(
        <div className="bg-secondary py-12 md:py-0 relative">
                <div className="hidden md:block w-full h-[60vh] md:h-[80vh] relative">
                    <Image
                      src="/assets/images/backgrounds/Section.png"
                      alt="Download App"
                      layout="fill"
                      objectFit="cover"
                      className="w-full h-full"
                    />
                  </div>
                  <div className="static md:absolute inset-y-0 left-0 flex flex-col justify-center ml-4">
                  <Motion variant="verticalSlideIn">
                    <div className="font-title text-white text-2xl md:text-5xl text-center md:text-start font-semibold">COMMANDEZ MAINTENANT <br />VOS REPAS SUR L&apos;APPLICATION</div>
                  </Motion>
                  <Motion variant="verticalSlideIn">
                    <div className="flex gap-4 justify-center items-center md:items-start md:justify-start font-semibold mt-8">
                    <Button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg">
                        <Play size={20} />
                        <span>Google Play</span>
                    </Button>
                    <Button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg">
                        <Apple size={20} />
                        <span>App Store</span>
                    </Button>
                    </div>
                  </Motion>
                  </div>
        </div>
    );
}