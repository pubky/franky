export interface DialogReplyTagsProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  /** Maximum number of tags allowed. Defaults to POST_MAX_TAGS from config */
  maxTags?: number;
  /** Whether the component is disabled */
  disabled?: boolean;
}
