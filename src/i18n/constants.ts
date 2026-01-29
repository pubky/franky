/**
 * RTL (Right-to-Left) language codes
 *
 * Languages that are written from right to left.
 * Used to set the `dir` attribute on the HTML element.
 */
export const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'] as const;

export type RtlLocale = (typeof RTL_LOCALES)[number];

/**
 * Check if a locale is RTL (Right-to-Left)
 */
export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.includes(locale as RtlLocale);
}
