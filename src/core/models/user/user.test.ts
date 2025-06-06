import { describe, it, expect, beforeEach } from 'vitest';
import {
  UserModel,
  TagModel,
  NexusUser,
  DEFAULT_USER_COUNTS,
  DEFAULT_USER_RELATIONSHIP,
  resetDatabase,
  generateTestUserId,
  createTestUserDetails,
} from '@/core';

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
      new TagModel({
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
      const user = new UserModel({
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

      expect(user).toBeInstanceOf(UserModel);
      expect(user.details.id).toBe(testUserId1);
      expect(user.details.name).toBe('Test User 1');
      expect(user.tags).toHaveLength(1);
      expect(user.tags[0]).toBeInstanceOf(TagModel);
    });
  });

  describe('Static Methods', () => {
    it('should insert and find user by id', async () => {
      const user = await UserModel.insert(mockNexusUser);
      expect(user).toBeInstanceOf(UserModel);
      expect(user.details.id).toBe(testUserId1);

      const foundUser = await UserModel.findById(testUserId1);
      expect(foundUser).toBeInstanceOf(UserModel);
      expect(foundUser.details.id).toBe(testUserId1);
      expect(foundUser.details.name).toBe('Test User 1');
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = generateTestUserId(999);
      await expect(UserModel.findById(nonExistentId)).rejects.toThrow(`User not found: ${nonExistentId}`);
    });

    it('should find users by ids', async () => {
      await UserModel.insert(mockNexusUser);
      await UserModel.insert({
        ...mockNexusUser,
        details: createTestUserDetails({
          id: testUserId2,
          name: 'Test User 2',
        }),
      });

      const users = await UserModel.find([testUserId1, testUserId2]);
      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(UserModel);
      expect(users[1]).toBeInstanceOf(UserModel);
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

      const results = await UserModel.bulkSave(usersData);
      expect(results).toHaveLength(2);
      results.forEach((user) => {
        expect(user).toBeInstanceOf(UserModel);
      });
    });

    it('should bulk delete users', async () => {
      await UserModel.insert(mockNexusUser);
      await UserModel.insert({
        ...mockNexusUser,
        details: createTestUserDetails({
          id: testUserId2,
          name: 'Test User 2',
        }),
      });

      await UserModel.bulkDelete([testUserId1, testUserId2]);

      await expect(UserModel.findById(testUserId1)).rejects.toThrow();
      await expect(UserModel.findById(testUserId2)).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let user: UserModel;

    beforeEach(async () => {
      user = await UserModel.insert(mockNexusUser);
    });

    it('should save user to database', async () => {
      user.details.name = 'Updated Name';
      await user.save();

      const foundUser = await UserModel.findById(testUserId1);
      expect(foundUser.details.name).toBe('Updated Name');
    });

    it('should edit user properties', async () => {
      await user.edit({
        details: { ...user.details, name: 'Edited Name' },
      });

      expect(user.details.name).toBe('Edited Name');

      const foundUser = await UserModel.findById(testUserId1);
      expect(foundUser.details.name).toBe('Edited Name');
    });

    it('should delete user from database', async () => {
      await user.delete();

      await expect(UserModel.findById(testUserId1)).rejects.toThrow(`User not found: ${testUserId1}`);
    });
  });
});
