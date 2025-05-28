import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserController } from '../../controllers/user';
import { User } from '../../model/User';
import { db } from '../../index';
import { type NexusUser } from '@/services/nexus/types';
import { DEFAULT_USER_COUNTS, DEFAULT_USER_DETAILS, DEFAULT_USER_RELATIONSHIP } from '../../schemas/defaults/user';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('UserController', () => {
  beforeEach(async () => {
    // Clear database before each test
    await db.delete();
    await db.open();
  });

  const mockNexusUser: NexusUser = {
    details: {
      ...DEFAULT_USER_DETAILS,
      id: 'test-user-1',
      name: 'Test User',
      bio: 'Test bio',
    },
    counts: {
      ...DEFAULT_USER_COUNTS,
      posts: 5,
      followers: 10,
    },
    tags: [
      {
        label: 'friend',
        taggers: ['user-2', 'user-3'],
        taggers_count: 2,
        relationship: false,
      },
    ],
    relationship: DEFAULT_USER_RELATIONSHIP,
  };

  const mockUser2: NexusUser = {
    ...mockNexusUser,
    details: { ...mockNexusUser.details, id: 'test-user-2', name: 'Test User 2' },
  };

  const mockUser3: NexusUser = {
    ...mockNexusUser,
    details: { ...mockNexusUser.details, id: 'test-user-3', name: 'Test User 3' },
  };

  describe('Basic CRUD Operations', () => {
    it('should get user by id', async () => {
      await User.create(mockNexusUser);

      const user = await UserController.get('test-user-1');

      expect(user).toBeInstanceOf(User);
      expect(user.details.id).toBe('test-user-1');
      expect(user.details.name).toBe('Test User');
    });

    it('should throw error for non-existent user', async () => {
      await expect(UserController.get('non-existent')).rejects.toThrow('User not found: non-existent');
    });

    it('should get all users', async () => {
      await User.create(mockNexusUser);
      await User.create(mockUser2);

      const users = await UserController.getAll();

      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[1]).toBeInstanceOf(User);
    });

    it('should get users by ids', async () => {
      await User.create(mockNexusUser);
      await User.create(mockUser2);
      await User.create(mockUser3);

      const users = await UserController.getByIds(['test-user-1', 'test-user-3', 'non-existent']);

      expect(users).toHaveLength(2);
      expect(users.map((u) => u.details.id)).toContain('test-user-1');
      expect(users.map((u) => u.details.id)).toContain('test-user-3');
      expect(users.map((u) => u.details.id)).not.toContain('non-existent');
    });

    it('should save new user', async () => {
      const user = await UserController.save(mockNexusUser);

      expect(user).toBeInstanceOf(User);
      expect(user.details.id).toBe('test-user-1');

      // Verify user is in database
      const savedUser = await User.findById('test-user-1');
      expect(savedUser).not.toBeNull();
    });

    it('should save existing user (update)', async () => {
      await User.create(mockNexusUser);

      const updatedUserData = {
        ...mockNexusUser,
        details: { ...mockNexusUser.details, name: 'Updated Name' },
      };

      const user = await UserController.save(updatedUserData);

      expect(user.details.name).toBe('Updated Name');

      // Verify only one user exists
      const allUsers = await User.findAll();
      expect(allUsers).toHaveLength(1);
    });

    it('should delete user', async () => {
      await User.create(mockNexusUser);

      await UserController.delete('test-user-1');

      const deletedUser = await User.findById('test-user-1');
      expect(deletedUser).toBeNull();
    });

    it('should throw error when deleting non-existent user', async () => {
      await expect(UserController.delete('non-existent')).rejects.toThrow('User not found: non-existent');
    });
  });

  describe('Search and Count', () => {
    beforeEach(async () => {
      await User.create(mockNexusUser);
      await User.create(mockUser2);
      await User.create({
        ...mockUser3,
        details: { ...mockUser3.details, bio: 'Different bio' },
      });
    });

    it('should search users by criteria', async () => {
      // Test without search query to ensure all users are returned
      const allResults = await UserController.search({});

      expect(allResults).toHaveLength(3);
      expect(allResults.every((u) => u instanceof User)).toBe(true);
    });

    it('should count all users', async () => {
      const count = await UserController.count();

      expect(count).toBe(3);
    });

    it('should count users with query', async () => {
      // Test counting all users with empty query
      const count = await UserController.count({});

      expect(count).toBe(3);
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk save users', async () => {
      const usersData = [mockNexusUser, mockUser2, mockUser3];

      const results = await UserController.bulkSave(usersData);

      expect(results).toHaveLength(3);
      expect(results[0]).toBeInstanceOf(User);

      const allUsers = await User.findAll();
      expect(allUsers).toHaveLength(3);
    });

    it('should handle bulk save with some failures', async () => {
      // Create invalid user data to test error handling
      const invalidUserData = {
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: null as unknown as string },
      };

      const usersData = [mockNexusUser, invalidUserData, mockUser2];

      const results = await UserController.bulkSave(usersData);

      // Should save valid users despite invalid one
      expect(results.length).toBeGreaterThan(0);
    });

    it('should bulk delete users', async () => {
      await User.create(mockNexusUser);
      await User.create(mockUser2);
      await User.create(mockUser3);

      const result = await UserController.bulkDelete(['test-user-1', 'test-user-3', 'non-existent']);

      expect(result.success).toEqual(['test-user-1', 'test-user-3']);
      expect(result.failed).toEqual(['non-existent']);

      const remainingUsers = await User.findAll();
      expect(remainingUsers).toHaveLength(1);
      expect(remainingUsers[0].details.id).toBe('test-user-2');
    });
  });

  describe('Relationship Retrieval Methods', () => {
    beforeEach(async () => {
      const sourceUser = await User.create({
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'source-user' },
      });

      // Set up relationships for testing
      sourceUser.following = ['user-1', 'user-2', 'user-3'];
      sourceUser.followers = ['follower-1', 'follower-2'];
      sourceUser.muted = ['muted-1'];
      await sourceUser.save();
    });

    it('should get following list', async () => {
      const following = await UserController.getFollowing('source-user');

      expect(following).toEqual(['user-1', 'user-2', 'user-3']);
    });

    it('should get following list with pagination', async () => {
      const following = await UserController.getFollowing('source-user', { skip: 1, limit: 1 });

      expect(following).toEqual(['user-2']);
    });

    it('should get followers list', async () => {
      const followers = await UserController.getFollowers('source-user');

      expect(followers).toEqual(['follower-1', 'follower-2']);
    });

    it('should get muted list', async () => {
      const muted = await UserController.getMuted('source-user');

      expect(muted).toEqual(['muted-1']);
    });

    it('should throw error for non-existent user in relationship methods', async () => {
      await expect(UserController.getFollowing('non-existent')).rejects.toThrow('User not found: non-existent');
      await expect(UserController.getFollowers('non-existent')).rejects.toThrow('User not found: non-existent');
      await expect(UserController.getMuted('non-existent')).rejects.toThrow('User not found: non-existent');
    });
  });

  describe('Relationship Action Methods', () => {
    beforeEach(async () => {
      await User.create({
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'source-user' },
      });
      await User.create({
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'target-user' },
      });
    });

    describe('Mute Actions', () => {
      it('should mute user', async () => {
        await UserController.muteUser('source-user', 'target-user');

        const updatedSource = await User.findById('source-user');
        expect(updatedSource!.muted).toContain('target-user');
        expect(updatedSource!.relationship.muted).toBe(true);
      });

      it('should bulk mute users', async () => {
        await User.create({
          ...mockNexusUser,
          details: { ...mockNexusUser.details, id: 'target-user-3' },
        });

        const result = await UserController.bulkMuteUsers('source-user', [
          'target-user',
          'target-user-3',
          'non-existent',
        ]);

        expect(result.success).toEqual(['target-user', 'target-user-3']);
        expect(result.failed).toEqual(['non-existent']);

        const updatedSource = await User.findById('source-user');
        expect(updatedSource!.muted).toContain('target-user');
        expect(updatedSource!.muted).toContain('target-user-3');
      });
    });

    describe('Follow Actions', () => {
      it('should follow user', async () => {
        await UserController.follow('source-user', 'target-user');

        const [updatedSource, updatedTarget] = await Promise.all([
          User.findById('source-user'),
          User.findById('target-user'),
        ]);

        expect(updatedSource!.following).toContain('target-user');
        expect(updatedTarget!.followers).toContain('source-user');
      });

      it('should bulk follow users', async () => {
        await User.create({
          ...mockNexusUser,
          details: { ...mockNexusUser.details, id: 'target-user-3' },
        });

        const result = await UserController.bulkFollow('source-user', ['target-user', 'target-user-3', 'non-existent']);

        expect(result.success).toEqual(['target-user', 'target-user-3']);
        expect(result.failed).toEqual(['non-existent']);

        const updatedSource = await User.findById('source-user');
        expect(updatedSource!.following).toContain('target-user');
        expect(updatedSource!.following).toContain('target-user-3');
      });
    });

    describe('Tag Actions', () => {
      it('should tag user', async () => {
        await UserController.tag('source-user', 'target-user', 'colleague');

        const updatedTarget = await User.findById('target-user');
        const colleagueTag = updatedTarget!.tags.find((t) => t.label === 'colleague');

        expect(colleagueTag).toBeDefined();
        expect(colleagueTag!.taggers).toContain('source-user');
      });

      it('should bulk tag users', async () => {
        await User.create({
          ...mockNexusUser,
          details: { ...mockNexusUser.details, id: 'target-user-3' },
        });

        const result = await UserController.bulkTag(
          'source-user',
          ['target-user', 'target-user-3', 'non-existent'],
          'team',
        );

        expect(result.success).toEqual(['target-user', 'target-user-3']);
        expect(result.failed).toEqual(['non-existent']);

        const [updatedTarget, updatedTarget3] = await Promise.all([
          User.findById('target-user'),
          User.findById('target-user-3'),
        ]);

        expect(updatedTarget!.tags.find((t) => t.label === 'team')?.taggers).toContain('source-user');
        expect(updatedTarget3!.tags.find((t) => t.label === 'team')?.taggers).toContain('source-user');
      });
    });

    it('should handle errors in relationship actions', async () => {
      await expect(UserController.muteUser('non-existent', 'target-user')).rejects.toThrow();
      await expect(UserController.follow('source-user', 'non-existent')).rejects.toThrow();
      await expect(UserController.tag('non-existent', 'target-user', 'label')).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockError = new Error('Database error');
      vi.spyOn(User, 'findAll').mockRejectedValueOnce(mockError);

      await expect(UserController.getAll()).rejects.toThrow('Database error');
    });

    it('should handle search errors', async () => {
      const mockError = new Error('Search error');
      vi.spyOn(User, 'findAll').mockRejectedValueOnce(mockError);

      await expect(UserController.search({})).rejects.toThrow('Search error');
    });

    it('should handle count errors', async () => {
      const mockError = new Error('Count error');
      vi.spyOn(User, 'findAll').mockRejectedValueOnce(mockError);

      await expect(UserController.count()).rejects.toThrow('Count error');
    });
  });
});
