export interface ProfileStats {
  notifications: number;
  posts: number;
  replies: number;
  followers: number;
  following: number;
  friends: number;
  uniqueTags: number;
}

export interface UseProfileStatsResult {
  stats: ProfileStats;
  isLoading: boolean;
}
