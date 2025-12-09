export interface RepostHeaderProps {
  isCurrentUserRepost: boolean;
  onUndo?: () => void;
  isUndoing?: boolean;
}
export interface RepostHeaderProps {
  /** Post ID of the repost */
  repostPostId: string;
}
