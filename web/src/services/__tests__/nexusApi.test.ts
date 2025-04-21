import { NexusApi } from '../nexusApi';
import {
  mockFileDetails,
  mockServerInfo,
  mockPostView,
  mockBookmark,
  mockPostCounts,
  mockPostDetails,
  mockTaggers,
  mockTags,
  mockSearch,
  mockHotTags,
  mockUserView,
  mockUserCounts,
  mockUserDetails,
  mockFollowers,
  mockFollowing,
  mockFriends,
  mockMuted,
  mockNotification,
  mockRelationship,
  mockVec,
  mockPostStream,
  mockUserStream
} from '../__mocks__/nexusApi.mocks';

// Mock do fetch global
global.fetch = jest.fn();

describe('NexusApi', () => {
  let api: NexusApi;
  const baseUrl = 'https://nexus.staging.pubky.app';

  beforeEach(() => {
    api = new NexusApi(baseUrl);
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mock helpers
  const mockFetchResponse = <T>(data: T) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(data),
    });
  };

  // File endpoints tests
  describe('File endpoints', () => {
    it('should get files by ids', async () => {
      const body = { uris: ['file1', 'file2'] };
      mockFetchResponse([mockFileDetails]);

      const result = await api.getFilesByIds(body);
      expect(result).toEqual([mockFileDetails]);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/files/by-ids`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );
    });

    it('should get file details', async () => {
      mockFetchResponse(mockFileDetails);

      const result = await api.getFileDetails('file1');
      expect(result).toEqual(mockFileDetails);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/files/file/file1`
      );
    });
  });

  // Info endpoint tests
  describe('Info endpoint', () => {
    it('should get server info', async () => {
      mockFetchResponse(mockServerInfo);

      const result = await api.getServerInfo();
      expect(result).toEqual(mockServerInfo);
      expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/v0/info`);
    });
  });

  // Post endpoints tests
  describe('Post endpoints', () => {
    it('should get post view', async () => {
      mockFetchResponse(mockPostView);

      const result = await api.getPostView('user1', 'post1', 'viewer1', 5, 5);
      expect(result).toEqual(mockPostView);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/post/user1/post1?viewer_id=viewer1&limit_tags=5&limit_taggers=5`
      );
    });

    it('should get post bookmark', async () => {
      mockFetchResponse(mockBookmark);

      const result = await api.getPostBookmark('user1', 'post1', 'viewer1');
      expect(result).toEqual(mockBookmark);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/post/user1/post1/bookmark?viewer_id=viewer1`
      );
    });

    it('should get post counts', async () => {
      mockFetchResponse(mockPostCounts);

      const result = await api.getPostCounts('user1', 'post1');
      expect(result).toEqual(mockPostCounts);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/post/user1/post1/counts`
      );
    });

    it('should get post details', async () => {
      mockFetchResponse(mockPostDetails);

      const result = await api.getPostDetails('user1', 'post1');
      expect(result).toEqual(mockPostDetails);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/post/user1/post1/details`
      );
    });

    it('should get post taggers', async () => {
      mockFetchResponse(mockTaggers);

      const result = await api.getPostTaggers('user1', 'post1', 'test', 'viewer1', 0, 10);
      expect(result).toEqual(mockTaggers);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/post/user1/post1/taggers/test?viewer_id=viewer1&skip=0&limit=10`
      );
    });

    it('should get post tags', async () => {
      mockFetchResponse(mockTags);

      const result = await api.getPostTags('user1', 'post1', 'viewer1', 0, 5, 5);
      expect(result).toEqual(mockTags);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/post/user1/post1/tags?viewer_id=viewer1&skip_tags=0&limit_tags=5&limit_taggers=5`
      );
    });
  });

  // Search endpoints tests
  describe('Search endpoints', () => {
    it('should search tags', async () => {
      mockFetchResponse([mockSearch]);

      const result = await api.searchTags('test', 'timeline', 0, 100, 0, 10);
      expect(result).toEqual([mockSearch]);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/search/tags/test?sorting=timeline&start=0&end=100&skip=0&limit=10`
      );
    });

    it('should search users', async () => {
      mockFetchResponse(mockSearch);

      const result = await api.searchUsers('test', 0, 10);
      expect(result).toEqual(mockSearch);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/search/users?username=test&skip=0&limit=10`
      );
    });
  });

  // Stream endpoints tests
  describe('Stream endpoints', () => {
    it('should stream posts', async () => {
      mockFetchResponse(mockPostStream);

      const result = await api.streamPosts(
        'following',
        'viewer1',
        'observer1',
        'user1',
        'post1',
        'timeline',
        'descending',
        ['test'],
        'short',
        0,
        10,
        0,
        100
      );
      expect(result).toEqual(mockPostStream);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/stream/posts?source=following&viewer_id=viewer1&observer_id=observer1&author_id=user1&post_id=post1&sorting=timeline&order=descending&tags=test&kind=short&skip=0&limit=10&start=0&end=100`
      );
    });

    it('should stream users', async () => {
      mockFetchResponse(mockUserStream);

      const result = await api.streamUsers(
        'user1',
        'viewer1',
        0,
        10,
        'followers',
        'wot',
        'all_time',
        false,
        'author1',
        'post1',
        2
      );
      expect(result).toEqual(mockUserStream);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/stream/users?user_id=user1&viewer_id=viewer1&skip=0&limit=10&source=followers&reach=wot&timeframe=all_time&preview=false&author_id=author1&post_id=post1&depth=2`
      );
    });

    it('should stream users by ids', async () => {
      mockFetchResponse(mockUserStream);

      const result = await api.streamUsersByIds(['user1', 'user2'], 'viewer1', 2);
      expect(result).toEqual(mockUserStream);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/stream/users/by_ids?viewer_id=viewer1&depth=2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_ids: ['user1', 'user2'] }),
        }
      );
    });

    it('should stream users by username', async () => {
      mockFetchResponse(mockUserStream);

      const result = await api.streamUsersByUsername('test', 'viewer1', 0, 10);
      expect(result).toEqual(mockUserStream);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/stream/users/username?username=test&viewer_id=viewer1&skip=0&limit=10`
      );
    });
  });

  // Tags endpoints tests
  describe('Tags endpoints', () => {
    it('should get hot tags', async () => {
      mockFetchResponse(mockHotTags);

      const result = await api.getHotTags('user1', 'wot', 20, 0, 10, 'all_time');
      expect(result).toEqual(mockHotTags);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/tags/hot?user_id=user1&reach=wot&taggers_limit=20&skip=0&limit=10&timeframe=all_time`
      );
    });

    it('should get tag taggers', async () => {
      mockFetchResponse(mockVec);

      const result = await api.getTagTaggers('test', 'wot', 'user1', 0, 10, 'all_time');
      expect(result).toEqual(mockVec);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/tags/taggers/test/wot?user_id=user1&skip=0&limit=10&timeframe=all_time`
      );
    });
  });

  // User endpoints tests
  describe('User endpoints', () => {
    it('should get user view', async () => {
      mockFetchResponse(mockUserView);

      const result = await api.getUserView('user1', 'viewer1', 2);
      expect(result).toEqual(mockUserView);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1?viewer_id=viewer1&depth=2`
      );
    });

    it('should get user counts', async () => {
      mockFetchResponse(mockUserCounts);

      const result = await api.getUserCounts('user1');
      expect(result).toEqual(mockUserCounts);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/counts`
      );
    });

    it('should get user details', async () => {
      mockFetchResponse(mockUserDetails);

      const result = await api.getUserDetails('user1');
      expect(result).toEqual(mockUserDetails);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/details`
      );
    });

    it('should get user followers', async () => {
      mockFetchResponse(mockFollowers);

      const result = await api.getUserFollowers('user1', 0, 10);
      expect(result).toEqual(mockFollowers);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/followers?skip=0&limit=10`
      );
    });

    it('should get user following', async () => {
      mockFetchResponse(mockFollowing);

      const result = await api.getUserFollowing('user1', 0, 10);
      expect(result).toEqual(mockFollowing);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/following?skip=0&limit=10`
      );
    });

    it('should get user friends', async () => {
      mockFetchResponse(mockFriends);

      const result = await api.getUserFriends('user1', 0, 10);
      expect(result).toEqual(mockFriends);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/friends?skip=0&limit=10`
      );
    });

    it('should get user muted', async () => {
      mockFetchResponse(mockMuted);

      const result = await api.getUserMuted('user1', 0, 10);
      expect(result).toEqual(mockMuted);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/muted?skip=0&limit=10`
      );
    });

    it('should get user notifications', async () => {
      mockFetchResponse([mockNotification]);

      const result = await api.getUserNotifications('user1', 0, 10, '2024-01-01', '2024-01-31');
      expect(result).toEqual([mockNotification]);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/notifications?skip=0&limit=10&start=2024-01-01&end=2024-01-31`
      );
    });

    it('should get user relationship', async () => {
      mockFetchResponse(mockRelationship);

      const result = await api.getUserRelationship('user1', 'viewer1');
      expect(result).toEqual(mockRelationship);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/relationship/viewer1`
      );
    });

    it('should get user taggers', async () => {
      mockFetchResponse(mockTaggers);

      const result = await api.getUserTaggers('user1', 'test', 0, 10, 'viewer1', 2);
      expect(result).toEqual(mockTaggers);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/taggers/test?skip=0&limit=10&viewer_id=viewer1&depth=2`
      );
    });

    it('should get user tags', async () => {
      mockFetchResponse(mockTags);

      const result = await api.getUserTags('user1', 0, 5, 5, 'viewer1', 2);
      expect(result).toEqual(mockTags);
      expect(global.fetch).toHaveBeenCalledWith(
        `${baseUrl}/v0/user/user1/tags?skip_tags=0&limit_tags=5&limit_taggers=5&viewer_id=viewer1&depth=2`
      );
    });
  });
}); 