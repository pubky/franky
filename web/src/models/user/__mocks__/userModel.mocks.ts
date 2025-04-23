import { IUserModel, UserDetails, UserCounts, UserRelationship, TagDetails, Link } from '../types';

export const mockLink: Link = {
  href: 'https://example.com',
  rel: 'website'
};

export const mockUserDetails: UserDetails = {
  name: 'Test User',
  bio: 'Test bio',
  image: 'https://example.com/image.jpg',
  links: [mockLink],
  status: 'active'
};

export const mockUserCounts: UserCounts = {
  posts: 10,
  replies: 5,
  tagged: 3,
  follower: 100,
  following: 50,
  friends: 20,
  tags: 15,
  unique_tags: 10,
  bookmarks: 8
};

export const mockUserRelationship: UserRelationship = {
  followed_by: true,
  following: true,
  muted: false
};

export const mockTagDetails: TagDetails = {
  label: 'test',
  relationship: true,
  taggers: ['user2', 'user3'],
  taggers_count: 2
};

export const mockUserModel: IUserModel = {
  id: 'user1',
  details: mockUserDetails,
  counts: mockUserCounts,
  relationship: mockUserRelationship,
  followers: ['user2', 'user3'],
  following: ['user4', 'user5'],
  tags: [mockTagDetails],
  mutes: ['user6'],
  indexed_at: 1704067200,
  updated_at: 1704067200,
  sync_status: 'nexus',
  sync_ttl: 1704153600
}; 