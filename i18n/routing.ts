import { defineRouting } from 'next-intl/routing';
import { locales } from '@/config/site';

export const routing = defineRouting({
  // La liste des langues qui sont supportées
  locales: locales,

  // Utilisé quand aucune langue ne correspond
  defaultLocale: 'fr'
});
