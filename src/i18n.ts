import { i18n } from '@lingui/core';

// The default locale ships in the main bundle, so a first visit doesn't wait
// for one more request before anything renders; the others load on demand
import { messages as enMessages } from './locales/en/messages.po';

/**
 * Load messages for requested locale and activate it.
 * This function isn't part of the LinguiJS library because there are
 * many ways how to load messages — from REST API, from file, from cache, etc.
 */
export async function loadCatalog(locale: string) {
  const messages =
    locale === 'en'
      ? enMessages
      : (await import(`./locales/${locale}/messages.po`)).messages;
  i18n.loadAndActivate({ locale, messages });
  document.documentElement.lang = locale;
}
