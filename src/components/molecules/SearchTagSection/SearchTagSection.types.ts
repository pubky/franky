import type { HotTag } from '@/hooks/useHotTags/useHotTags.types';

export interface SearchTagSectionProps {
  title: string;
  tags: HotTag[];
  onTagClick: (tag: string) => void;
}
