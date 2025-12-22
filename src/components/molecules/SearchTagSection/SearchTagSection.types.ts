/**
 * Base interface for tags displayed in SearchTagSection
 * Only requires name, making it compatible with HotTag, AutocompleteTag, etc.
 */
export interface SearchTag {
  name: string;
}

export interface SearchTagSectionProps {
  title: string;
  tags: SearchTag[];
  onTagClick: (tag: string) => void;
}
