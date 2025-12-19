import type { HotTag } from '@/hooks/useHotTags/useHotTags.types';

export interface SearchSuggestionsProps {
  hotTags: HotTag[];
  onTagClick: (tag: string) => void;
}
