import { POST_INPUT_VARIANT } from './PostInput.constants';

export type PostInputVariant = (typeof POST_INPUT_VARIANT)[keyof typeof POST_INPUT_VARIANT];

export interface PostInputProps {
  /** Variant determines if this is a reply, repost, or a new post */
  variant: PostInputVariant;
  /** Optional parent post ID (required if variant is 'reply') */
  postId?: string;
  /** Optional original post ID (required if variant is 'repost') */
  originalPostId?: string;
  /** Callback after successful post, receives the created post ID */
  onSuccess?: (createdPostId: string) => void;
  /** Custom placeholder text (default: "What's on your mind?" for create, "Write a reply..." for reply) */
  placeholder?: string;
  /** Show the thread connector (for replies, default: false) */
  showThreadConnector?: boolean;
  /**
   * Controls whether the component starts in expanded mode.
   * When false (default), shows a compact version that expands on click/focus.
   * When true, shows the full version with tags and action bar visible.
   * @default false
   */
  expanded?: boolean;
  /** Hide article button in action bar (default: false) */
  hideArticle?: boolean;
}
