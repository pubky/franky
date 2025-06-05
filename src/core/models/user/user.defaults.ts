import { UserCounts, UserDetails, UserRelationship } from '@/core';

// User defaults
export const DEFAULT_USER_COUNTS: UserCounts = {
  tagged: 0,
  tags: 0,
  unique_tags: 0,
  posts: 0,
  replies: 0,
  following: 0,
  followers: 0,
  friends: 0,
  bookmarks: 0,
};

export const DEFAULT_USER_DETAILS: UserDetails = {
  name: '',
  bio: '',
  id: '',
  links: null,
  status: null,
  image: null,
  indexed_at: Date.now(),
};

export const DEFAULT_USER_RELATIONSHIP: UserRelationship = {
  followed_by: false,
  following: false,
  muted: false,
};
