"use client";
import { siteConfig } from "@/config/site";
import { useMounted } from "@/hooks/use-mounted";
import { Loader2 } from "lucide-react";
import ChickenNationLogo from "./common/chicken-nation-logo";

const Loader = () => {
  const mounted = useMounted();

  return mounted ? null : (
    <div className=" h-screen flex items-center justify-center flex-col space-y-2">
      <div className="flex gap-2 items-center ">
        <ChickenNationLogo />
        <span className="text-xl font-semibold text-default-900 ">
          {siteConfig.name}
        </span>
      </div>
      <span className=" inline-flex gap-1  items-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </span>
    </div>
  );
};

export default Loader;
