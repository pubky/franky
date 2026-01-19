import type { LanguageOption } from './LanguageSelector.types';

/** Available languages for the application */
export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'US English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', disabled: true },
  { code: 'de', name: 'German', flag: '🇩🇪', disabled: true },
  { code: 'fr', name: 'French', flag: '🇫🇷', disabled: true },
  { code: 'it', name: 'Italian', flag: '🇮🇹', disabled: true },
];
