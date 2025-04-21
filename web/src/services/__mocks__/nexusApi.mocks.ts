import { 
  Bookmark, 
  FileDetails,
  FileUrls,
  PostCounts, 
  PostDetails, 
  PostView, 
  ServerInfo, 
  TagDetails, 
  TagSearch, 
  TaggersInfoDTO, 
  UserCounts, 
  UserDetails, 
  UserView, 
  UserSearch, 
  Followers, 
  Following, 
  Friends, 
  Muted, 
  PostStream, 
  UserStream, 
  HotTags,
  HotTag,
  Notification,
  NotificationBody,
  Relationship,
  PostRelationships,
  Vec 
} from '../../types/api';

export const mockFileUrls: FileUrls = {
  feed: null,
  main: 'https://example.com/file.jpg',
  small: null
};

export const mockFileDetails: FileDetails = {
  content_type: 'image/jpeg',
  created_at: 1704067200,
  id: 'file1',
  indexed_at: 1704067200,
  metadata: null,
  name: 'test.jpg',
  owner_id: 'user1',
  size: 1024,
  src: 'local',
  uri: 'file://test.jpg',
  urls: mockFileUrls
};

export const mockServerInfo: ServerInfo = {
  description: 'Test Server',
  homepage: 'https://example.com',
  license: 'MIT',
  name: 'Test',
  repository: 'https://github.com/test/test',
  version: '1.0.0',
  commit_hash: 'abc123',
  last_index_snapshot: '2024-01-01',
  base_file_url: 'https://example.com/files'
};

export const mockPostCounts: PostCounts = {
  tags: 5,
  unique_tags: 3,
  replies: 10,
  reposts: 5
};

export const mockPostDetails: PostDetails = {
  attachments: null,
  author: 'user1',
  content: 'Test post',
  id: 'post1',
  indexed_at: 1704067200,
  kind: 'short',
  uri: 'post://test'
};

export const mockPostRelationships: PostRelationships = {
  mentioned: [],
  replied: null,
  reposted: null
};

export const mockBookmark: Bookmark = {
  id: 'bookmark1',
  indexed_at: 1704067200
};

export const mockTagDetails: TagDetails = {
  label: 'test',
  relationship: false,
  taggers: ['user1', 'user2'],
  taggers_count: 2
};

export const mockPostView: PostView = {
  bookmark: mockBookmark,
  counts: mockPostCounts,
  details: mockPostDetails,
  relationships: mockPostRelationships,
  tags: [mockTagDetails]
};

export const mockTaggers: TaggersInfoDTO = {
  users: ['user1', 'user2'],
  relationship: false
};

export const mockTags: TagDetails[] = [mockTagDetails];

export const mockTagSearch: TagSearch = {
  post_key: 'post1',
  score: 0.8
};

export const mockSearch: UserSearch = ['user1', 'user2'];

export const mockHotTag: HotTag = {
  label: 'test',
  taggers_id: ['user1', 'user2'],
  tagged_count: 10,
  taggers_count: 2
};

export const mockHotTags: HotTags = [mockHotTag];

export const mockUserCounts: UserCounts = {
  tagged: 50,
  tags: 30,
  unique_tags: 20,
  posts: 200,
  replies: 100,
  following: 50,
  followers: 100,
  friends: 25,
  bookmarks: 75
};

export const mockUserDetails: UserDetails = {
  bio: 'Test user bio',
  id: 'user1',
  image: null,
  indexed_at: 1704067200,
  links: null,
  name: 'Test User',
  status: null
};

export const mockRelationship: Relationship = {
  following: true,
  followed_by: false,
  muted: false
};

export const mockUserView: UserView = {
  counts: mockUserCounts,
  details: mockUserDetails,
  relationship: mockRelationship,
  tags: [mockTagDetails]
};

export const mockNotificationBody: NotificationBody = {
  type: 'follow',
  followed_by: 'user2'
};

export const mockNotification: Notification = {
  timestamp: 1704067200,
  body: mockNotificationBody
};

export const mockFollowers: Followers = ['user2', 'user3'];
export const mockFollowing: Following = ['user4', 'user5'];
export const mockFriends: Friends = ['user6', 'user7'];
export const mockMuted: Muted = ['user8', 'user9'];
export const mockPostStream: PostStream = [mockPostView];
export const mockUserStream: UserStream = [mockUserView];
export const mockVec: Vec = ['item1', 'item2']; 