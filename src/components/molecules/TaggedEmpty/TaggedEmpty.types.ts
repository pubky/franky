export interface TaggedEmptyProps {
  onTagAdd?: (tag: string) => Promise<{ success: boolean; error?: string }>;
}
