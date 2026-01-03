export interface PostHeaderProps {
  postId: string;
  isReplyInput?: boolean;
  characterLimit?: {
    count: number;
    max: number;
  };
  showPopover?: boolean;
}
