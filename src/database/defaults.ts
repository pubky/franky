import { type PostCounts, type PostRelationships } from './schemas/post';
import { type UserCounts, type UserDetails, type UserRelationship } from './schemas/user';

// Post defaults
export const DEFAULT_POST_COUNTS: PostCounts = {
  tags: 0,
  unique_tags: 0,
  replies: 0,
  reposts: 0,
};

export const DEFAULT_POST_RELATIONSHIPS: PostRelationships = {
  mentioned: [],
  replied: null,
  reposted: null,
};

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
