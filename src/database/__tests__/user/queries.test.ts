import { beforeEach, describe, expect, it } from 'vitest';
import { userModel } from '@/database/models/user';
import {
  resetDatabase,
  generateTestUserId,
  createTestUserDetails,
  createTestUsers,
  createTagRelationship,
  createFollowRelationship
} from '@/test/helpers';

describe('UserModel Queries', () => {
  const TEST_USER_ID = generateTestUserId(0);
  const TEST_USER_ID_2 = generateTestUserId(1);

  beforeEach(async () => {
    await resetDatabase();
  });

  describe('getTags', () => {
    beforeEach(async () => {
      await createTestUsers(2);

      // Add multiple tags
      await createTagRelationship(TEST_USER_ID, TEST_USER_ID_2, 'friend');
      await createTagRelationship(TEST_USER_ID, TEST_USER_ID_2, 'colleague');
      await createTagRelationship(TEST_USER_ID, TEST_USER_ID_2, 'family');
    });

    it('should get all tags with default pagination', async () => {
      const tags = await userModel.getTags(TEST_USER_ID_2);

      expect(tags).toHaveLength(3);
      expect(tags.map(t => t.label)).toContain('friend');
      expect(tags.map(t => t.label)).toContain('colleague');
      expect(tags.map(t => t.label)).toContain('family');
    });

    it('should respect pagination parameters', async () => {
      const tags = await userModel.getTags(TEST_USER_ID_2, 1, 2);

      expect(tags).toHaveLength(2);
    });

    it('should return empty array for non-existent user', async () => {
      const tags = await userModel.getTags('non-existent-user');

      expect(tags).toHaveLength(0);
    });
  });

  describe('getTaggers', () => {
    beforeEach(async () => {
      await createTestUsers(3);
      const TEST_USER_ID_3 = generateTestUserId(2);
      
      await createTagRelationship(TEST_USER_ID, TEST_USER_ID_2, 'friend');
      await createTagRelationship(TEST_USER_ID_3, TEST_USER_ID_2, 'friend');
    });

    it('should get all taggers for a specific tag', async () => {
      const taggers = await userModel.getTaggers(TEST_USER_ID_2, 'friend');

      expect(taggers).toHaveLength(2);
      expect(taggers).toContain(TEST_USER_ID);
    });

    it('should return empty array for non-existent tag', async () => {
      const taggers = await userModel.getTaggers(TEST_USER_ID_2, 'non-existent-tag');

      expect(taggers).toHaveLength(0);
    });
  });

  describe('getFollowing/getFollowers', () => {
    beforeEach(async () => {
      await createTestUsers(3);
      const TEST_USER_ID_3 = generateTestUserId(2);

      await createFollowRelationship(TEST_USER_ID, TEST_USER_ID_2);
      await createFollowRelationship(TEST_USER_ID, TEST_USER_ID_3);
      await createFollowRelationship(TEST_USER_ID_3, TEST_USER_ID);
    });

    it('should get following list with pagination', async () => {
      const following = await userModel.getFollowing(TEST_USER_ID);

      expect(following).toHaveLength(2);
      expect(following).toContain(TEST_USER_ID_2);
    });

    it('should get followers list with pagination', async () => {
      const followers = await userModel.getFollowers(TEST_USER_ID);

      expect(followers).toHaveLength(1);
      expect(followers[0]).toBeDefined();
    });
  });

  describe('getPreview', () => {
    it('should get user preview data', async () => {
      const details = createTestUserDetails();
      await userModel.new(TEST_USER_ID, details);
      const preview = await userModel.getPreview(TEST_USER_ID);

      expect(preview).toBeDefined();
      expect(preview?.id).toBe(TEST_USER_ID);
      expect(preview?.details).toMatchObject(details);
      expect(preview?.counts).toBeDefined();
      expect(Object.keys(preview!)).toHaveLength(3);
    });

    it('should return null for non-existent user', async () => {
      const preview = await userModel.getPreview('non-existent-user');

      expect(preview).toBeNull();
    });
  });

  describe('getName', () => {
    it('should get user name', async () => {
      const details = createTestUserDetails({ name: 'Test User' });
      await userModel.new(TEST_USER_ID, details);

      const name = await userModel.getName(TEST_USER_ID);

      expect(name).toBe('Test User');
    });

    it('should return null for non-existent user', async () => {
      const name = await userModel.getName('non-existent-user');

      expect(name).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should get complete user data', async () => {
      const details = createTestUserDetails();
      await userModel.new(TEST_USER_ID, details);
      const user = await userModel.getUser(TEST_USER_ID);

      expect(user).toBeDefined();
      expect(user?.id).toBe(TEST_USER_ID);
      expect(user?.details).toMatchObject(details);
      expect(user?.counts).toBeDefined();
      expect(user?.relationship).toBeDefined();
      expect(user?.followers).toBeDefined();
      expect(user?.following).toBeDefined();
      expect(user?.tags).toBeDefined();
      expect(user?.mutes).toBeDefined();
    });

    it('should return null for non-existent user', async () => {
      const user = await userModel.getUser('non-existent-user');

      expect(user).toBeNull();
    });
  });
}); 