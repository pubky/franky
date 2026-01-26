export const WHO_TO_FOLLOW_SORT = {
  SUGGESTED: 'suggested',
  MUTUAL: 'mutual',
  FOLLOWERS: 'followers',
  USERNAME: 'username',
} as const;

export type WhoToFollowSortType = (typeof WHO_TO_FOLLOW_SORT)[keyof typeof WHO_TO_FOLLOW_SORT];
