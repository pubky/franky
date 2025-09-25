import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('UserDetailsModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testUserId1 = Core.generateTestUserId(1);
  const testUserId2 = Core.generateTestUserId(2);

  const MOCK_NEXUS_USER_DETAILS: Omit<Core.NexusUserDetails, 'id'> = {
    name: 'Test User',
    bio: 'This is a test user bio',
    image: 'https://example.com/avatar.jpg',
    indexed_at: Date.now(),
    links: [
      { title: 'Website', url: 'https://example.com' },
      { title: 'GitHub', url: 'https://github.com/testuser' },
    ],
    status: 'active',
  };

  describe('Constructor', () => {
    it('should create UserDetailsModel instance with all properties', () => {
      const mockUserDetailsData = {
        id: testUserId1,
        ...MOCK_NEXUS_USER_DETAILS,
      };

      const userDetails = new Core.UserDetailsModel(mockUserDetailsData);

      expect(userDetails.id).toBe(mockUserDetailsData.id);
      expect(userDetails.name).toBe(mockUserDetailsData.name);
      expect(userDetails.bio).toBe(mockUserDetailsData.bio);
      expect(userDetails.image).toBe(mockUserDetailsData.image);
      expect(userDetails.indexed_at).toBe(mockUserDetailsData.indexed_at);
      expect(userDetails.links).toEqual(mockUserDetailsData.links);
      expect(userDetails.status).toBe(mockUserDetailsData.status);
    });
  });

  describe('Static Methods', () => {
    it('should insert user details', async () => {
      const mockUserDetailsData = {
        id: testUserId1,
        ...MOCK_NEXUS_USER_DETAILS,
      };

      const result = await Core.UserDetailsModel.insert(mockUserDetailsData);
      expect(result).toBeDefined();
    });

    it('should find user details by id', async () => {
      const mockUserDetailsData = {
        id: testUserId1,
        ...MOCK_NEXUS_USER_DETAILS,
      };

      await Core.UserDetailsModel.insert(mockUserDetailsData);
      const result = await Core.UserDetailsModel.findById(testUserId1);

      expect(result).toBeInstanceOf(Core.UserDetailsModel);
      expect(result.id).toBe(testUserId1);
      expect(result.name).toBe(MOCK_NEXUS_USER_DETAILS.name);
      expect(result.bio).toBe(MOCK_NEXUS_USER_DETAILS.bio);
    });

    it('should throw error for non-existent user details', async () => {
      const nonExistentId = Core.generateTestUserId(999);
      await expect(Core.UserDetailsModel.findById(nonExistentId)).rejects.toThrow(
        `Record not found in user_details: ${nonExistentId}`,
      );
    });

    it('should bulk save user details', async () => {
      const mockUserDetailsArray: Core.NexusUserDetails[] = [
        { id: testUserId1, ...MOCK_NEXUS_USER_DETAILS },
        {
          id: testUserId2,
          ...MOCK_NEXUS_USER_DETAILS,
          name: 'Test User 2',
          bio: 'Second test user bio',
        },
      ];

      const result = await Core.UserDetailsModel.bulkSave(mockUserDetailsArray);
      expect(result).toBeDefined();

      // Verify the data was saved correctly
      const userDetails1 = await Core.UserDetailsModel.findById(testUserId1);
      const userDetails2 = await Core.UserDetailsModel.findById(testUserId2);

      expect(userDetails1.name).toBe('Test User');
      expect(userDetails2.name).toBe('Test User 2');
      expect(userDetails2.bio).toBe('Second test user bio');
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.UserDetailsModel.bulkSave([]);
      // bulkPut with empty array returns undefined, which is expected
      expect(result).toBeUndefined();
    });

    it('should handle multiple user details with different data', async () => {
      const mockDetailsArray: Core.NexusUserDetails[] = [
        { id: testUserId1, ...MOCK_NEXUS_USER_DETAILS },
        {
          id: testUserId2,
          ...MOCK_NEXUS_USER_DETAILS,
          name: 'Another User',
          bio: 'Different bio',
          image: null,
          links: null,
          status: null,
        },
      ];

      await Core.UserDetailsModel.bulkSave(mockDetailsArray);

      const userDetails1 = await Core.UserDetailsModel.findById(testUserId1);
      const userDetails2 = await Core.UserDetailsModel.findById(testUserId2);

      expect(userDetails1.name).toBe('Test User');
      expect(userDetails1.image).toBe('https://example.com/avatar.jpg');
      expect(userDetails1.links).toHaveLength(2);
      expect(userDetails2.name).toBe('Another User');
      expect(userDetails2.image).toBeNull();
      expect(userDetails2.links).toBeNull();
      expect(userDetails1.status).toBe('active');
      expect(userDetails2.status).toBeNull();
      expect(userDetails1.links).toEqual([
        { title: 'Website', url: 'https://example.com' },
        { title: 'GitHub', url: 'https://github.com/testuser' },
      ]);
      expect(userDetails2.links).toBeNull();
    });

    it('should handle user details with null values', async () => {
      const mockUserDetailsWithNulls: Core.NexusUserDetails = {
        id: testUserId1,
        name: 'Minimal User',
        bio: '',
        image: null,
        indexed_at: Date.now(),
        links: null,
        status: null,
      };

      const result = await Core.UserDetailsModel.insert(mockUserDetailsWithNulls);
      expect(result).toBeDefined();

      const foundUser = await Core.UserDetailsModel.findById(testUserId1);
      expect(foundUser.name).toBe('Minimal User');
      expect(foundUser.image).toBeNull();
      expect(foundUser.links).toBeNull();
      expect(foundUser.status).toBeNull();
    });
  });
});
