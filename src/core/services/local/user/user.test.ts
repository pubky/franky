import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as Core from '@/core';
import { LocalUserService } from './user';

describe('LocalUserService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await Core.UserDetailsModel.table.clear();
    await Core.UserRelationshipsModel.table.clear();
    await Core.UserCountsModel.table.clear();
  });

  describe('readDetails', () => {
    const userId = 'test-user-id' as Core.Pubky;

    it('should return user details from local database when found', async () => {
      const mockUserDetails: Core.NexusUserDetails = {
        id: userId,
        name: 'Test User',
        bio: 'Test bio',
        image: 'https://example.com/avatar.jpg',
        status: 'active',
        links: [{ title: 'Website', url: 'https://example.com' }],
        indexed_at: Date.now(),
      };

      await Core.UserDetailsModel.create(mockUserDetails);

      const result = await LocalUserService.readDetails({ userId });

      expect(result).not.toBeNull();
      expect(result!.id).toBe(userId);
      expect(result!.name).toBe('Test User');
      expect(result!.bio).toBe('Test bio');
      expect(result!.image).toBe('https://example.com/avatar.jpg');
      expect(result!.status).toBe('active');
      expect(result!.links).toEqual([{ title: 'Website', url: 'https://example.com' }]);
    });

    it('should return null when user not found in local database', async () => {
      const result = await LocalUserService.readDetails({ userId });

      expect(result).toBeNull();
    });

    it('should handle user with minimal fields', async () => {
      const minimalUserDetails: Core.NexusUserDetails = {
        id: userId,
        name: 'Minimal User',
        bio: '',
        image: null,
        status: null,
        links: null,
        indexed_at: Date.now(),
      };

      await Core.UserDetailsModel.create(minimalUserDetails);

      const result = await LocalUserService.readDetails({ userId });

      expect(result).not.toBeNull();
      expect(result!.id).toBe(userId);
      expect(result!.name).toBe('Minimal User');
      expect(result!.bio).toBe('');
      expect(result!.image).toBeNull();
      expect(result!.status).toBeNull();
      expect(result!.links).toBeNull();
    });
  });

  describe('readRelationships', () => {
    const userId = 'test-user-id' as Core.Pubky;

    it('should return user relationships from local database when found', async () => {
      const mockRelationships: Core.UserRelationshipsModelSchema = {
        id: userId,
        following: true,
        followed_by: true,
        muted: false,
      };

      await Core.UserRelationshipsModel.create(mockRelationships);

      const result = await LocalUserService.readRelationships({ userId });

      expect(result).not.toBeNull();
      expect(result!.following).toBe(true);
      expect(result!.followed_by).toBe(true);
      expect(result!.muted).toBe(false);
    });

    it('should return null when user relationships not found in local database', async () => {
      const result = await LocalUserService.readRelationships({ userId });

      expect(result).toBeNull();
    });

    it('should handle user with all false relationships', async () => {
      const emptyRelationships: Core.UserRelationshipsModelSchema = {
        id: userId,
        following: false,
        followed_by: false,
        muted: false,
      };

      await Core.UserRelationshipsModel.create(emptyRelationships);

      const result = await LocalUserService.readRelationships({ userId });

      expect(result).not.toBeNull();
      expect(result!.following).toBe(false);
      expect(result!.followed_by).toBe(false);
      expect(result!.muted).toBe(false);
    });
  });

  describe('updateCounts', () => {
    const userId = 'test-user-id' as Core.Pubky;

    it('should update user counts by applying count changes', async () => {
      const initialCounts: Core.UserCountsModelSchema = {
        id: userId,
        tagged: 0,
        tags: 0,
        unique_tags: 0,
        posts: 5,
        replies: 2,
        following: 10,
        followers: 20,
        friends: 5,
        bookmarks: 3,
      };

      await Core.UserCountsModel.create(initialCounts);

      await LocalUserService.updateCounts({
        userId,
        countChanges: { posts: 1, replies: 1 },
      });

      const result = await Core.UserCountsModel.findById(userId);

      expect(result).not.toBeNull();
      expect(result!.posts).toBe(6);
      expect(result!.replies).toBe(3);
      expect(result!.following).toBe(10);
    });

    it('should not go below zero when decrementing counts', async () => {
      const initialCounts: Core.UserCountsModelSchema = {
        id: userId,
        tagged: 0,
        tags: 0,
        unique_tags: 0,
        posts: 1,
        replies: 0,
        following: 0,
        followers: 0,
        friends: 0,
        bookmarks: 0,
      };

      await Core.UserCountsModel.create(initialCounts);

      await LocalUserService.updateCounts({
        userId,
        countChanges: { posts: -5 },
      });

      const result = await Core.UserCountsModel.findById(userId);

      expect(result).not.toBeNull();
      expect(result!.posts).toBe(0);
    });

    it('should do nothing if user does not exist', async () => {
      await LocalUserService.updateCounts({
        userId,
        countChanges: { posts: 1 },
      });

      const result = await Core.UserCountsModel.findById(userId);
      expect(result).toBeNull();
    });
  });
});
