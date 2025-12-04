import type { PostInputVariant } from './PostInput.constants';

export interface PostInputProps {
  /** Variant determines if this is a reply or a new post */
  variant: PostInputVariant;
  /** Optional parent post ID (required if variant is 'reply') */
  postId?: string;
  /** Callback after successful post */
  onSuccess?: () => void;
  /** Custom placeholder text (default: "What's on your mind?" for create, "Write a reply..." for reply) */
  placeholder?: string;
  /** Show the thread connector (for replies, default: false) */
  showThreadConnector?: boolean;
}
