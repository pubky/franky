export interface UsePostHeaderUserInfoPopoverActionsResult {
  isLoading: boolean;
  onEditClick: (e: React.MouseEvent) => void;
  onFollowClick: (e: React.MouseEvent) => Promise<void>;
}
