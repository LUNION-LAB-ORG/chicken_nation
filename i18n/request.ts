import fs from 'fs';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import path from 'path';
import { routing } from './routing';
import { loadMessages } from '@/utils/loadMessages';

export default getRequestConfig(async ({ requestLocale }) => {

  //  obtenir le locale demandé
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  //  charger les messages
  const messages = await loadMessages(locale);

  return {
    locale,
    messages
  };
});


