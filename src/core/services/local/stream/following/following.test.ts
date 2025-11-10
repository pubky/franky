import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('LocalStreamFollowingService', () => {
  const streamId = Core.UserStreamTypes.TODAY_FOLLOWING_ALL;
  const DEFAULT_USER = 'user-1' as Core.Pubky;
  const BASE_TIMESTAMP = 1000000;
  const NON_EXISTENT_STREAM_ID = Core.UserStreamTypes.TODAY_FOLLOWING_ALL;

  // ============================================================================
  // Test Helpers
  // ============================================================================

  const createMockNexusUser = (
    userId: Core.Pubky = DEFAULT_USER,
    overrides?: Partial<Core.NexusUser>,
  ): Core.NexusUser => ({
    details: {
      id: userId,
      name: `User ${userId}`,
      bio: 'Bio content',
      links: null,
      status: null,
      image: null,
      indexed_at: BASE_TIMESTAMP,
      ...overrides?.details,
    },
    counts: {
      tagged: 0,
      tags: 0,
      unique_tags: 0,
      posts: 0,
      replies: 0,
      following: 0,
      followers: 0,
      friends: 0,
      bookmarks: 0,
      ...overrides?.counts,
    },
    tags: overrides?.tags ?? [],
    relationship: {
      following: false,
      followed_by: false,
      muted: false,
      ...overrides?.relationship,
    },
    ...overrides,
  });

  const createStream = async (userIds: Core.Pubky[]) => {
    await Core.LocalStreamFollowingService.upsert({ streamId, stream: userIds });
  };

  const verifyStream = async (expectedUserIds: Core.Pubky[]) => {
    const result = await Core.UserStreamModel.findById(streamId);
    expect(result).toBeTruthy();
    expect(result!.stream).toEqual(expectedUserIds);
  };

  const verifyStreamDoesNotExist = async () => {
    const result = await Core.UserStreamModel.findById(streamId);
    expect(result).toBeNull();
  };

  const verifyUserPersisted = async (userId: Core.Pubky, expectedName: string) => {
    const details = await Core.UserDetailsModel.findById(userId);
    expect(details).toBeTruthy();
    expect(details?.name).toBe(expectedName);

    const counts = await Core.UserCountsModel.findById(userId);
    expect(counts).toBeTruthy();

    const relationships = await Core.UserRelationshipsModel.findById(userId);
    expect(relationships).toBeTruthy();

    const tags = await Core.UserTagsModel.findById(userId);
    expect(tags).toBeTruthy();
  };

  const persistAndVerifyUser = async (userId: Core.Pubky, overrides?: Partial<Core.NexusUser>) => {
    const mockUser = createMockNexusUser(userId, overrides);

    const result = await Core.LocalStreamFollowingService.persistUsers([mockUser]);

    expect(result).toEqual([userId]);
    return { userId, mockUser };
  };

  beforeEach(async () => {
    // Clear all relevant tables
    await Core.UserStreamModel.table.clear();
    await Core.UserDetailsModel.table.clear();
    await Core.UserCountsModel.table.clear();
    await Core.UserRelationshipsModel.table.clear();
    await Core.UserTagsModel.table.clear();
  });

  describe('upsert', () => {
    it('should create a new stream with user IDs', async () => {
      const userIds: Core.Pubky[] = ['user1' as Core.Pubky, 'user2' as Core.Pubky, 'user3' as Core.Pubky];

      await Core.LocalStreamFollowingService.upsert({ streamId, stream: userIds });

      await verifyStream(userIds);
    });

    it('should update an existing stream with new user IDs', async () => {
      const initialIds: Core.Pubky[] = ['user1' as Core.Pubky, 'user2' as Core.Pubky];
      const updatedIds: Core.Pubky[] = [...initialIds, 'user3' as Core.Pubky];

      await createStream(initialIds);
      await Core.LocalStreamFollowingService.upsert({ streamId, stream: updatedIds });

      await verifyStream(updatedIds);
    });

    it('should handle empty array', async () => {
      await Core.LocalStreamFollowingService.upsert({ streamId, stream: [] });

      await verifyStream([]);
    });
  });

  describe('findById', () => {
    it('should return stream when it exists', async () => {
      const userIds: Core.Pubky[] = ['user1' as Core.Pubky, 'user2' as Core.Pubky];
      await createStream(userIds);

      const result = await Core.LocalStreamFollowingService.findById(streamId);

      expect(result).toBeTruthy();
      expect(result!.stream).toEqual(userIds);
    });

    it('should return null when stream does not exist', async () => {
      const result = await Core.LocalStreamFollowingService.findById(NON_EXISTENT_STREAM_ID);

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete an existing stream', async () => {
      const userIds: Core.Pubky[] = ['user1' as Core.Pubky, 'user2' as Core.Pubky];
      await createStream(userIds);
      await Core.LocalStreamFollowingService.deleteById(streamId);
      await verifyStreamDoesNotExist();
    });

    it('should not throw error when deleting non-existent stream', async () => {
      await expect(Core.LocalStreamFollowingService.deleteById(NON_EXISTENT_STREAM_ID)).resolves.not.toThrow();
    });
  });

  describe('persistUsers', () => {
    it('should persist users and return user IDs', async () => {
      const mockUsers: Core.NexusUser[] = [
        createMockNexusUser('user-1' as Core.Pubky),
        createMockNexusUser('user-2' as Core.Pubky),
      ];

      const result = await Core.LocalStreamFollowingService.persistUsers(mockUsers);

      expect(result).toEqual(['user-1', 'user-2']);
      await verifyUserPersisted('user-1' as Core.Pubky, 'User user-1');
      await verifyUserPersisted('user-2' as Core.Pubky, 'User user-2');
    });

    it('should handle users with tags', async () => {
      const mockTag: Core.NexusTag = {
        label: 'developer',
        taggers: ['user-2' as Core.Pubky],
        taggers_count: 1,
        relationship: true,
      };
      const { userId } = await persistAndVerifyUser('user-1' as Core.Pubky, {
        tags: [new Core.TagModel(mockTag)],
      });

      const userTags = await Core.UserTagsModel.findById(userId);
      expect(userTags).toBeTruthy();
      expect(userTags?.tags).toHaveLength(1);
      expect(userTags?.tags[0].label).toBe('developer');
      expect(userTags?.tags[0].taggers).toEqual(['user-2']);
    });

    it('should handle users with relationships', async () => {
      const { userId } = await persistAndVerifyUser('user-1' as Core.Pubky, {
        relationship: {
          following: true,
          followed_by: true,
          muted: false,
        },
      });

      const relationships = await Core.UserRelationshipsModel.findById(userId);
      expect(relationships).toBeTruthy();
      expect(relationships?.following).toBe(true);
      expect(relationships?.followed_by).toBe(true);
      expect(relationships?.muted).toBe(false);
    });

    it('should handle users with counts', async () => {
      const { userId } = await persistAndVerifyUser('user-1' as Core.Pubky, {
        counts: {
          tagged: 5,
          tags: 3,
          unique_tags: 2,
          posts: 100,
          replies: 50,
          following: 200,
          followers: 150,
          friends: 75,
          bookmarks: 25,
        },
      });

      const counts = await Core.UserCountsModel.findById(userId);
      expect(counts).toBeTruthy();
      expect(counts?.posts).toBe(100);
      expect(counts?.followers).toBe(150);
      expect(counts?.following).toBe(200);
    });

    it('should handle empty array', async () => {
      const result = await Core.LocalStreamFollowingService.persistUsers([]);

      expect(result).toEqual([]);
    });
  });

  describe('persistNewStreamChunk', () => {
    it('should append new stream chunk to existing stream', async () => {
      const initialStream: Core.Pubky[] = ['user-1' as Core.Pubky, 'user-2' as Core.Pubky];
      const newChunk: Core.Pubky[] = ['user-3' as Core.Pubky, 'user-4' as Core.Pubky];

      await createStream(initialStream);
      await Core.LocalStreamFollowingService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      await verifyStream([...initialStream, ...newChunk]);
    });

    it('should throw error when stream does not exist', async () => {
      await expect(
        Core.LocalStreamFollowingService.persistNewStreamChunk({
          streamId: NON_EXISTENT_STREAM_ID,
          stream: ['user-1' as Core.Pubky],
        }),
      ).rejects.toThrow(`Following stream not found: ${NON_EXISTENT_STREAM_ID}`);
    });

    it('should handle appending to empty stream', async () => {
      const newChunk: Core.Pubky[] = ['user-1' as Core.Pubky, 'user-2' as Core.Pubky];

      await createStream([]);
      await Core.LocalStreamFollowingService.persistNewStreamChunk({
        streamId,
        stream: newChunk,
      });

      await verifyStream(newChunk);
    });

    it('should handle appending empty chunk', async () => {
      const initialStream: Core.Pubky[] = ['user-1' as Core.Pubky];

      await createStream(initialStream);
      await Core.LocalStreamFollowingService.persistNewStreamChunk({
        streamId,
        stream: [],
      });

      await verifyStream(initialStream);
    });
  });
});
