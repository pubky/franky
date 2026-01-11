export interface PostHeaderUserInfoProps {
  userId: string;
  userName: string;
  avatarUrl?: string;
  characterLimit?: {
    count: number;
    max: number;
  };
  showPopover?: boolean;
}
