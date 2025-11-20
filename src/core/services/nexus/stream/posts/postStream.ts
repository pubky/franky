import * as Core from '@/core';

/**
 * Nexus Post Stream Service
 *
 * Handles fetching post stream data from Nexus API.
 */
export class NexusPostStreamService {
  /**
   * Fetches post stream data from Nexus API
   *
   * @param params - Parameters for fetching post stream data
   * @returns Post stream data
   */
  static async fetch({
    params,
    invokeEndpoint,
    extraParams,
  }: Core.TPostStreamFetchParams): Promise<Core.NexusPostsKeyStream | undefined> {
    // TEMPORARY: Mock data for bookmarks testing
    if (invokeEndpoint === Core.StreamSource.BOOKMARKS) {
      return await this.generateMockBookmarks(params);
    }


    let nexusEndpoint: string;
    switch (invokeEndpoint) {
      case Core.StreamSource.ALL:
        nexusEndpoint = Core.postStreamApi.all(params);
        break;
      case Core.StreamSource.FOLLOWING:
      case Core.StreamSource.FRIENDS:
      case Core.StreamSource.BOOKMARKS:
        // TODO: from now, always is going to be
        if (!params.viewer_id) {
          throw new Error('Viewer ID is required for friends stream');
        }
        nexusEndpoint = Core.postStreamApi[invokeEndpoint]({ ...params, observer_id: params.viewer_id });
        break;
      case Core.StreamSource.REPLIES:
        nexusEndpoint = Core.postStreamApi[invokeEndpoint]({
          ...params,
          ...extraParams,
        } as Core.TStreamPostRepliesParams);
        break;
      case Core.StreamSource.AUTHOR:
      case Core.StreamSource.AUTHOR_REPLIES:
        nexusEndpoint = Core.postStreamApi[invokeEndpoint]({ ...params, ...extraParams } as Core.TStreamAuthorParams);
        break;
      default:
        throw new Error(`Invalid stream type: ${invokeEndpoint}`);
    }
    return await Core.queryNexus<Core.NexusPostsKeyStream>(nexusEndpoint);
  }

  // TEMPORARY: Mock bookmark data generator for testing
  private static async generateMockBookmarks(params: Core.TStreamBase): Promise<Core.NexusPostsKeyStream> {
    const limit = params.limit || 10;
    const totalMockPosts = 45; // Enough for multiple pages
    const baseTimestamp = Date.now();

    // Ensure mock users exist in the database (only create once)
    await this.ensureMockUsersExist();

    // For timeline streams, use 'start' (timestamp) for pagination
    // If start is provided, get posts older than that timestamp
    const startTimestamp = params.start || baseTimestamp;

    const posts: Core.NexusPost[] = [];
    let count = 0;

    // Generate posts from most recent to oldest
    for (let i = 0; i < totalMockPosts && count < limit; i++) {
      const postTimestamp = baseTimestamp - i * 60000; // 1 minute apart

      // Skip posts that are newer than or equal to the start timestamp
      if (postTimestamp >= startTimestamp) {
        continue;
      }

      const postId = `mock-post-${i}`;
      const authorId = `did:key:mock-author-${i % 5}` as Core.Pubky; // 5 different authors

      posts.push({
        details: {
          id: postId,
          content: `This is mock bookmarked post #${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. This post has enough content to look realistic in the UI.`,
          indexed_at: postTimestamp,
          author: authorId,
          kind: 'Short',
          uri: `pubky://${authorId}/pub/pubky.app/posts/${postId}`,
          attachments: i % 3 === 0 ? ['https://picsum.photos/400/300?random=' + i] : null,
        },
        counts: {
          tags: Math.floor(Math.random() * 10),
          unique_tags: Math.floor(Math.random() * 5),
          replies: Math.floor(Math.random() * 20),
          reposts: Math.floor(Math.random() * 15),
        },
        tags: [],
        relationships: {
          replied: null,
          reposted: null,
          mentioned: [],
        },
        bookmark: {
          created_at: postTimestamp,
          updated_at: postTimestamp,
        },
      });

      count++;
    }

    // IMPORTANT: Persist the mock posts to IndexedDB immediately
    // This ensures they're available when the UI tries to render them
    if (posts.length > 0) {
      await Core.LocalStreamPostsService.persistPosts(posts);
    }

    // Return in the format expected by master: NexusPostsKeyStream
    return {
      post_keys: posts.map((post) => post.details.id),
      last_post_score: posts.length > 0 ? posts[posts.length - 1].details.indexed_at : baseTimestamp,
    };
  }

  // TEMPORARY: Ensure mock users exist in the database
  private static async ensureMockUsersExist(): Promise<void> {
    // Check if mock users already exist
    const firstMockUserId = 'did:key:mock-author-0' as Core.Pubky;
    const existingUser = await Core.UserDetailsModel.findById(firstMockUserId);

    if (existingUser) {
      return; // Mock users already exist
    }

    // Create 5 mock users
    const mockUsers: Core.NexusUser[] = [];
    for (let i = 0; i < 5; i++) {
      const userId = `did:key:mock-author-${i}` as Core.Pubky;
      mockUsers.push({
        details: {
          id: userId,
          name: `Mock User ${i + 1}`,
          bio: `This is a mock user account #${i + 1} for testing bookmarks.`,
          image: `https://i.pravatar.cc/150?u=mock-${i}`,
          links: null,
          status: null,
          indexed_at: Date.now(),
        },
        counts: {
          tagged: 0,
          tags: 0,
          unique_tags: 0,
          posts: Math.floor(Math.random() * 50),
          replies: Math.floor(Math.random() * 100),
          following: Math.floor(Math.random() * 200),
          followers: Math.floor(Math.random() * 150),
          friends: Math.floor(Math.random() * 50),
          bookmarks: 0,
        },
        tags: [],
        relationship: {
          following: false,
          followed_by: false,
          muted: false,
        },
      });
    }

    // Persist mock users to IndexedDB
    await Core.LocalStreamUsersService.persistUsers(mockUsers);
  }
}
