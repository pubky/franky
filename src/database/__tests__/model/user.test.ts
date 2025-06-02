import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '../../model/user';
import { Tag } from '../../model/shared/tag';
import { type NexusUser } from '@/services/nexus/types';
import { DEFAULT_USER_COUNTS, DEFAULT_USER_RELATIONSHIP } from '../../schemas/defaults/user';
import { generateTestUserId, createTestUserDetails, resetDatabase } from '@/test/helpers';

describe('User Model', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  const testUserId1 = generateTestUserId(1);
  const testUserId2 = generateTestUserId(2);

  const mockNexusUser: NexusUser = {
    details: createTestUserDetails({
      id: testUserId1,
      name: 'Test User 1',
    }),
    counts: DEFAULT_USER_COUNTS,
    tags: [
      new Tag({
        label: 'test-tag',
        taggers: [testUserId2],
        taggers_count: 1,
        relationship: false,
      }),
    ],
    relationship: DEFAULT_USER_RELATIONSHIP,
  };

  describe('Constructor and Properties', () => {
    it('should create a User instance with all properties', () => {
      const user = new User({
        ...mockNexusUser,
        id: mockNexusUser.details.id,
        following: [],
        followers: [],
        muted: [],
        indexed_at: null,
        updated_at: Date.now(),
        sync_status: 'local',
        sync_ttl: Date.now() + 3600000,
      });

      expect(user).toBeInstanceOf(User);
      expect(user.details.id).toBe(testUserId1);
      expect(user.details.name).toBe('Test User 1');
      expect(user.tags).toHaveLength(1);
      expect(user.tags[0]).toBeInstanceOf(Tag);
    });
  });

  describe('Static Methods', () => {
    it('should insert and find user by id', async () => {
      const user = await User.insert(mockNexusUser);
      expect(user).toBeInstanceOf(User);
      expect(user.details.id).toBe(testUserId1);

      const foundUser = await User.findById(testUserId1);
      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser.details.id).toBe(testUserId1);
      expect(foundUser.details.name).toBe('Test User 1');
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = generateTestUserId(999);
      await expect(User.findById(nonExistentId)).rejects.toThrow(`User not found: ${nonExistentId}`);
    });

    it('should find users by ids', async () => {
      await User.insert(mockNexusUser);
      await User.insert({
        ...mockNexusUser,
        details: createTestUserDetails({
          id: testUserId2,
          name: 'Test User 2',
        }),
      });

      const users = await User.find([testUserId1, testUserId2]);
      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[1]).toBeInstanceOf(User);
    });

    it('should bulk save users', async () => {
      const usersData: NexusUser[] = [
        mockNexusUser,
        {
          ...mockNexusUser,
          details: createTestUserDetails({
            id: testUserId2,
            name: 'Test User 2',
          }),
        },
      ];

      const results = await User.bulkSave(usersData);
      expect(results).toHaveLength(2);
      results.forEach((user) => {
        expect(user).toBeInstanceOf(User);
      });
    });

    it('should bulk delete users', async () => {
      await User.insert(mockNexusUser);
      await User.insert({
        ...mockNexusUser,
        details: createTestUserDetails({
          id: testUserId2,
          name: 'Test User 2',
        }),
      });

      await User.bulkDelete([testUserId1, testUserId2]);

      await expect(User.findById(testUserId1)).rejects.toThrow();
      await expect(User.findById(testUserId2)).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let user: User;

    beforeEach(async () => {
      user = await User.insert(mockNexusUser);
    });

    it('should save user to database', async () => {
      user.details.name = 'Updated Name';
      await user.save();

      const foundUser = await User.findById(testUserId1);
      expect(foundUser.details.name).toBe('Updated Name');
    });

    it('should edit user properties', async () => {
      await user.edit({
        details: { ...user.details, name: 'Edited Name' },
      });

      expect(user.details.name).toBe('Edited Name');

      const foundUser = await User.findById(testUserId1);
      expect(foundUser.details.name).toBe('Edited Name');
    });

    it('should delete user from database', async () => {
      await user.delete();

      await expect(User.findById(testUserId1)).rejects.toThrow(`User not found: ${testUserId1}`);
    });
  });
});
