export interface TagInputProps {
  onTagAdd: (tag: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>;
  placeholder?: string;
  existingTags?: Array<{ label: string }>;
}
