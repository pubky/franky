export interface SearchTag {
  label: string;
  color?: string;
}

export interface SearchTagSectionProps {
  title: string;
  tags: SearchTag[];
  onTagClick: (tag: string) => void;
}
