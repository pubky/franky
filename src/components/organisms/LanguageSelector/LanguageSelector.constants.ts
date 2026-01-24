import type { LanguageOption } from './LanguageSelector.types';

/** Available languages for the application */
export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'US English', flag: '🇺🇸' },
  { code: 'pt-BR', name: 'Portugues (Brasil)', flag: '🇧🇷' },
  { code: 'es', name: 'Espanol', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Francais', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];
