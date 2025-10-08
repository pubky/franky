/**
 * Normalizes PubkyAppPost kind string to lowercase internal format
 *
 * The pubky-app-specs library returns kind as a string ('Short', 'Long', 'Image', etc.)
 * but our internal types use lowercase ('short', 'long', 'image', etc.)
 *
 * @param kind - Kind string from PubkyAppPost (e.g., 'Short', 'Long')
 * @returns Normalized lowercase kind string
 */
export function normalizePostKind(kind: string): string {
  return kind.toLowerCase();
}
