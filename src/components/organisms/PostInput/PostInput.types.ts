import { POST_INPUT_VARIANT } from './PostInput.constants';

export type PostInputVariant = (typeof POST_INPUT_VARIANT)[keyof typeof POST_INPUT_VARIANT];

export interface PostInputProps {
  /** Variant determines if this is a reply or a new post */
  variant: PostInputVariant;
  /** Optional parent post ID (required if variant is 'reply') */
  postId?: string;
  /** Callback after successful post, receives the created post ID */
  onSuccess?: (createdPostId: string) => void;
  /** Custom placeholder text (default: "What's on your mind?" for create, "Write a reply..." for reply) */
  placeholder?: string;
  /** Show the thread connector (for replies, default: false) */
  showThreadConnector?: boolean;
}
