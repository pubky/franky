import type { PostInputActionSubmitMode } from '../PostInputActionBar/PostInputActionBar.types';

export interface PostInputExpandableSectionProps {
  isExpanded: boolean;
  content: string;
  tags: string[];
  isSubmitting: boolean;
  isDisabled?: boolean;
  submitMode: PostInputActionSubmitMode;
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  onSubmit: () => void | Promise<void>;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (open: boolean) => void;
  onEmojiSelect: (emoji: { native: string }) => void;
  className?: string;
}
