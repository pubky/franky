import type { AvatarGroupItem } from '@/molecules/AvatarGroup/AvatarGroup.types';

export interface PostHeaderUserInfoPopoverStatsProps {
  followersCount: number;
  followingCount: number;
  followersAvatars: AvatarGroupItem[];
  followingAvatars: AvatarGroupItem[];
  maxAvatars: number;
}
