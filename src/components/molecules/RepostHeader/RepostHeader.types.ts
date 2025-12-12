export interface RepostHeaderProps {
  /**
   * Undo the repost (deletes the repost post).
   * This component is intended to be rendered only for reposts made by the current user.
   */
  onUndo: () => void;
  isUndoing?: boolean;
}
