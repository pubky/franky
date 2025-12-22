import { MAX_ACTIVE_SEARCH_TAGS } from '@/core/stores/search/search.constants';

/**
 * Parse tags from URL search params
 * @param tagsParam - Raw tags parameter from URL (comma-separated)
 * @returns Array of normalized tag strings
 */
export function parseTagsFromUrl(tagsParam: string | null): string[] {
  if (!tagsParam || tagsParam.trim() === '') {
    return [];
  }
  return tagsParam
    .split(',')
    .map((tag) => decodeURIComponent(tag.trim()).toLowerCase())
    .filter((tag) => tag.length > 0)
    .slice(0, MAX_ACTIVE_SEARCH_TAGS);
}
