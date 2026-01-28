import { TAG_INPUT_MAX_SUGGESTIONS } from './useTagInput.constants';

/**
 * Filter tags for autocomplete suggestions based on input text.
 * Returns tags that contain the input text (case-insensitive),
 * excluding exact matches.
 */
export function filterSuggestions<T extends { label: string }>(
  tags: T[],
  inputValue: string,
  maxResults = TAG_INPUT_MAX_SUGGESTIONS,
): T[] {
  const trimmed = inputValue.trim();
  if (!trimmed) return [];

  const inputText = trimmed.toLowerCase();

  return tags
    .filter((tag) => {
      const tagLabel = tag.label.toLowerCase();
      return tagLabel.includes(inputText) && tagLabel !== inputText;
    })
    .slice(0, maxResults);
}
