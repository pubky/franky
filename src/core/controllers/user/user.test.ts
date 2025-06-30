import { describe, it, expect, beforeEach } from 'vitest';
import {
  UserController,
  UserModel,
  NexusUser,
  DEFAULT_USER_COUNTS,
  DEFAULT_USER_RELATIONSHIP,
  resetDatabase,
  generateTestUserId,
  createTestUserDetails,
} from '@/core';

describe('UserController', () => {
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
    tags: [],
    relationship: DEFAULT_USER_RELATIONSHIP,
  };

  const mockUser2: NexusUser = {
    details: createTestUserDetails({
      id: testUserId2,
      name: 'Test User 2',
    }),
    counts: DEFAULT_USER_COUNTS,
    tags: [],
    relationship: DEFAULT_USER_RELATIONSHIP,
  };

  describe('Basic CRUD Operations', () => {
    it('should save and get user by id', async () => {
      const savedUser = await UserController.save(mockNexusUser);
      expect(savedUser).toBeInstanceOf(UserModel);
      expect(savedUser.details.id).toBe(testUserId1);

      const retrievedUser = await UserController.get(testUserId1);
      expect(retrievedUser).toBeInstanceOf(UserModel);
      expect(retrievedUser.details.id).toBe(testUserId1);
      expect(retrievedUser.details.name).toBe('Test User 1');
    });

    it('should throw error for non-existent user', async () => {
      const nonExistentId = generateTestUserId(999);
      await expect(UserController.get(nonExistentId)).rejects.toThrow(`User not found: ${nonExistentId}`);
    });

    it('should get users by ids', async () => {
      await UserController.save(mockNexusUser);
      await UserController.save(mockUser2);

      const users = await UserController.getByIds([testUserId1, testUserId2]);

      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(UserModel);
      expect(users[1]).toBeInstanceOf(UserModel);
      expect(users.map((u) => u.details.id)).toContain(testUserId1);
      expect(users.map((u) => u.details.id)).toContain(testUserId2);
    });

    it('should update existing user when saving with same id', async () => {
      await UserController.save(mockNexusUser);

      const updatedUserData = {
        ...mockNexusUser,
        details: createTestUserDetails({
          id: testUserId1,
          name: 'Updated Name',
        }),
      };

      const updatedUser = await UserController.save(updatedUserData);
      expect(updatedUser.details.name).toBe('Updated Name');
    });

    it('should delete user', async () => {
      await UserController.save(mockNexusUser);

      await UserController.delete(testUserId1);

      await expect(UserController.get(testUserId1)).rejects.toThrow(`User not found: ${testUserId1}`);
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk save users', async () => {
      const usersData = [mockNexusUser, mockUser2];

      const results = await UserController.bulkSave(usersData);

      expect(results).toHaveLength(2);
      results.forEach((user) => {
        expect(user).toBeInstanceOf(UserModel);
      });

      // Verify users are saved
      const user1 = await UserController.get(testUserId1);
      const user2 = await UserController.get(testUserId2);
      expect(user1.details.name).toBe('Test User 1');
      expect(user2.details.name).toBe('Test User 2');
    });

    it('should bulk delete users', async () => {
      await UserController.save(mockNexusUser);
      await UserController.save(mockUser2);

      await UserController.bulkDelete([testUserId1, testUserId2]);

      await expect(UserController.get(testUserId1)).rejects.toThrow();
      await expect(UserController.get(testUserId2)).rejects.toThrow();
    });

    it('should continue bulk operations even if some fail', async () => {
      await UserController.save(mockNexusUser);

      const nonExistentId = generateTestUserId(999);
      // Try to bulk delete both existing and non-existing users
      await UserController.bulkDelete([testUserId1, nonExistentId]);

      // Should not throw, just continue
      await expect(UserController.get(testUserId1)).rejects.toThrow();
    });
  });
});
