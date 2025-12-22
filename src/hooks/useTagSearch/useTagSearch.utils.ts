import { APP_ROUTES } from '@/app/routes';
import { MAX_ACTIVE_SEARCH_TAGS } from '@/core/stores/search/search.constants';

/**
 * Builds search URL from tags array
 * Note: Tags should be normalized (lowercase, trimmed) before calling
 */
export function buildSearchUrl(tags: string[]): string {
  if (tags.length === 0) return APP_ROUTES.SEARCH;
  const tagsParam = tags.map((t) => encodeURIComponent(t)).join(',');
  return `${APP_ROUTES.SEARCH}?tags=${tagsParam}`;
}

/**
 * Calculates new tags array when adding a tag
 * Uses same logic as store's addActiveTag for consistency
 * Note: Tag should be normalized (lowercase, trimmed) before calling
 */
export function calculateNewTags(currentTags: string[], newTag: string): string[] {
  if (newTag.length === 0) return currentTags;

  // Check if tag already exists
  const existingIndex = currentTags.indexOf(newTag);

  if (existingIndex >= 0) {
    // Move existing tag to end (same as store logic)
    const tagsWithoutExisting = currentTags.filter((t) => t !== newTag);
    return [...tagsWithoutExisting, newTag];
  }

  // If at max, remove oldest (first) tag
  if (currentTags.length >= MAX_ACTIVE_SEARCH_TAGS) {
    return [...currentTags.slice(1), newTag];
  }

  return [...currentTags, newTag];
}
