import { defineRouting } from "next-intl/routing";

import { locales } from "@/config/site";

export const routing = defineRouting({
  // Le français seulement (config/site.ts) ; préfixe /fr gardé pour ne pas
  // changer les adresses déjà indexées.
  locales: locales,
  defaultLocale: "fr",

  // Une seule langue : ni la langue du navigateur ni un cookie ne doivent
  // envoyer ailleurs que vers /fr (un navigateur en arabe allait sur /ar).
  localeDetection: false,
  localeCookie: false,

  // Plus d'en-tête `Link: hreflang` : il annonçait des versions anglaise et
  // arabe qui n'étaient que des copies du français.
  alternateLinks: false,
});
