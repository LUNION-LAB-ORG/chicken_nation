"use client";

import { useDeepLinkRedirect } from "@/features/marketing/app-mobile/hooks/useDeepLinkRedirect";
import { Suspense } from "react";
import Image from "next/image";

function AppMobileDeepLinkContent() {
  const { status, itemName } = useDeepLinkRedirect();

  return (
    <div className="flex flex-col items-center justify-between min-h-[100dvh] w-full max-w-2xl mx-auto px-6 py-10 bg-[#FAFAFA]">
      
      {/* 1. HEADER (Logo + Slogan) */}
      <div className="flex flex-col items-center mt-6">
        <div className="relative w-28 h-28 mb-6 bg-[#ff6200] rounded-[32px] shadow-xl shadow-[#ff6200]/20 flex items-center justify-center overflow-hidden">
          <Image
            src="/assets/images/logo_2.png"
            alt="Chicken Nation"
            fill
            className="object-contain p-4"
            priority
          />
        </div>
        
        <h1 className="text-[#ff6200] font-title text-4xl md:text-5xl font-bold text-center tracking-wider leading-tight">
          DELICIEUX
          <br />
          JUSQU&apos;A L&apos;OS
        </h1>
      </div>

      {/* 2. CENTRE (Bucket Loader & Texte Dynamique) */}
      <div className="flex flex-col items-center justify-center w-full my-8">
        
        {/* Animation du Seau */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border-[4px] border-[#ff6200]/30 blur-md animate-pulse"></div>
          <div className="absolute inset-2 rounded-full border-[4px] border-slate-200 border-t-[#ff6200] border-r-[#ff6200] animate-spin"></div>
          <div className="absolute inset-6 rounded-full bg-[#fff5f0] flex items-center justify-center shadow-inner">
            <div className="relative w-24 h-24 transform transition-transform duration-700 animate-pulse">
              <Image
                src="/assets/images/illustrations/page-accueil/seau.png"
                alt="Chargement Chicken Nation"
                fill
                className="object-contain drop-shadow-md"
                priority
              />
            </div>
          </div>
        </div>

        {/* 💡 LE TEXTE DYNAMIQUE */}
        <div className="flex flex-col items-center bg-white px-8 py-6 rounded-3xl shadow-sm border border-slate-100 min-w-[300px]">
          <h2 className="text-xl md:text-2xl font-urbanist-black text-slate-800 text-center uppercase leading-tight animate-pulse">
            {status}
          </h2>
          
          {/* Si on a trouvé le nom du plat ou de la catégorie, on l'affiche en grand avec la police titre ! */}
          {itemName && (
            <p className="mt-3 text-[#ff6200] font-title text-2xl md:text-3xl text-center leading-none">
              {itemName}
            </p>
          )}

          <p className="text-sm md:text-base text-slate-500 font-urbanist-medium text-center max-w-[280px] mt-4">
            Veuillez patienter, nous vous connectons à l&apos;application...
          </p>
        </div>
      </div>

      {/* 3. FOOTER (Horloge) */}
      <div className="flex flex-col items-center mt-auto pt-6 w-full">
        <div className="flex items-center gap-3 mb-4 bg-white py-2 px-5 rounded-full shadow-sm border border-slate-100">
          <div className="relative w-6 h-6 flex-shrink-0">
            <Image
              src="/assets/images/illustrations/page-accueil/horloge.png"
              alt="Horloge"
              fill
              className="object-contain"
            />
          </div>
          <span className="font-urbanist-bold text-[#ff6200] text-sm uppercase tracking-wide">
            Livraison en moins de 30 min
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-urbanist-medium text-center max-w-xs">
          Redirection automatique. Si l&apos;application ne s&apos;ouvre pas, vous serez redirigé vers votre Store.
        </p>
      </div>
    </div>
  );
}
export default function AppMobileDeepLink() {
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-6"></div>
            <p className="text-2xl font-urbanist-bold text-center text-slate-800 animate-pulse">
              Chargement...
            </p>
          </div>
        }
      >
        <AppMobileDeepLinkContent />
      </Suspense>
    </div>
  );
}