import { POST_INPUT_VARIANT } from './PostInput.constants';

export type PostInputVariant =
  | typeof POST_INPUT_VARIANT.REPLY
  | typeof POST_INPUT_VARIANT.POST
  | typeof POST_INPUT_VARIANT.REPOST;

interface PostInputBaseProps {
  /** Callback after successful post, receives the created post ID */
  onSuccess?: (createdPostId: string) => void;
  /** Custom placeholder text (default depends on variant) */
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
  /** Callback when content or tags change, receives content and tags */
  onContentChange?: (content: string, tags: string[]) => void;
}

export type PostInputProps =
  | (PostInputBaseProps & {
      /** Variant: reply */
      variant: typeof POST_INPUT_VARIANT.REPLY;
      /** Parent post ID (required for replies) */
      postId: string;
      originalPostId?: never;
    })
  | (PostInputBaseProps & {
      /** Variant: repost */
      variant: typeof POST_INPUT_VARIANT.REPOST;
      /** Original post ID (required for reposts) */
      originalPostId: string;
      postId?: never;
    })
  | (PostInputBaseProps & {
      /** Variant: new root post */
      variant: typeof POST_INPUT_VARIANT.POST;
      postId?: never;
      originalPostId?: never;
    });
