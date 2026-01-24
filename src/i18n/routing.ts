import { defineRouting } from 'next-intl/routing';

/**
 * i18n Routing Configuration
 *
 * Defines supported locales and routing behavior.
 * Uses 'never' for localePrefix to avoid locale in URLs.
 * Language is determined via cookie instead.
 */
export const routing = defineRouting({
  locales: ['en', 'pt-BR'],
  defaultLocale: 'en',
  localePrefix: 'never',
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
