import { beforeEach, describe, expect, it } from 'vitest';
import { userModel } from '@/database/models/user';
import {
  resetDatabase,
  generateTestUserId,
  createTestUserDetails,
  createTestUsers,
} from '@/test/helpers';

describe('UserModel Mutations', () => {
  const TEST_USER_ID = generateTestUserId(0);
  const TEST_USER_ID_2 = generateTestUserId(1);

  beforeEach(async () => {
    await resetDatabase();
  });

  describe('new', () => {
    it('should create a new user with default values', async () => {
      const user = await userModel.new(TEST_USER_ID);

      expect(user.id).toBe(TEST_USER_ID);
      expect(user.details.name).toBe('');
      expect(user.counts.posts).toBe(0);
      expect(user.followers).toHaveLength(0);
      expect(user.following).toHaveLength(0);
      expect(user.tags).toHaveLength(0);
      expect(user.mutes).toHaveLength(0);
      expect(user.sync_status).toBe('local');
      expect(user.indexed_at).toBeNull();
      expect(user.updated_at).toBeDefined();
      expect(user.sync_ttl).toBeGreaterThan(user.updated_at);
    });

    it('should create a new user with custom details', async () => {
      const details = createTestUserDetails({
        name: 'Custom Name',
        links: [{ url: 'https://test.com', title: 'Test' }]
      });

      const user = await userModel.new(TEST_USER_ID, details);

      expect(user.id).toBe(TEST_USER_ID);
      expect(user.details).toMatchObject(details);
    });
  });

  describe('edit', () => {
    it('should update user details', async () => {
      await userModel.new(TEST_USER_ID);

      const updates = {
        name: 'Updated Name',
        bio: 'Updated Bio'
      };

      await userModel.edit(TEST_USER_ID, updates);

      const user = await userModel.getUser(TEST_USER_ID);
      expect(user?.details.name).toBe(updates.name);
      expect(user?.details.bio).toBe(updates.bio);
    });
  });

  describe('follow', () => {
    beforeEach(async () => {
      await createTestUsers(2);
    });

    it('should create follow relationship', async () => {
      await userModel.follow('PUT', TEST_USER_ID, TEST_USER_ID_2);

      const user1 = await userModel.getUser(TEST_USER_ID);
      const user2 = await userModel.getUser(TEST_USER_ID_2);

      expect(user1?.following).toContain(TEST_USER_ID_2);
      expect(user1?.counts.following).toBe(1);
      expect(user2?.followers).toContain(TEST_USER_ID);
      expect(user2?.counts.follower).toBe(1);
    });

    it('should remove follow relationship', async () => {
      await userModel.follow('PUT', TEST_USER_ID, TEST_USER_ID_2);
      await userModel.follow('DEL', TEST_USER_ID, TEST_USER_ID_2);

      const user1 = await userModel.getUser(TEST_USER_ID);
      const user2 = await userModel.getUser(TEST_USER_ID_2);

      expect(user1?.following).not.toContain(TEST_USER_ID_2);
      expect(user1?.counts.following).toBe(0);
      expect(user2?.followers).not.toContain(TEST_USER_ID);
      expect(user2?.counts.follower).toBe(0);
    });
  });

  describe('tag', () => {
    beforeEach(async () => {
      await createTestUsers(2);
    });

    it('should add a new tag', async () => {
      await userModel.tag('PUT', TEST_USER_ID, TEST_USER_ID_2, 'friend');

      const user = await userModel.getUser(TEST_USER_ID_2);
      const tag = user?.tags[0];

      expect(tag?.label).toBe('friend');
      expect(tag?.taggers).toContain(TEST_USER_ID);
      expect(tag?.taggers_count).toBe(1);
      expect(user?.counts.tags).toBe(1);
      expect(user?.counts.unique_tags).toBe(1);
      expect(user?.counts.tagged).toBe(1);
    });

    it('should update existing tag', async () => {
      await userModel.tag('PUT', TEST_USER_ID, TEST_USER_ID_2, 'friend');
      
      const TEST_USER_ID_3 = generateTestUserId(2);
      await userModel.new(TEST_USER_ID_3);
      await userModel.tag('PUT', TEST_USER_ID_3, TEST_USER_ID_2, 'friend');

      const user = await userModel.getUser(TEST_USER_ID_2);
      const tag = user?.tags[0];

      expect(tag?.taggers).toHaveLength(2);
      expect(tag?.taggers_count).toBe(2);
      expect(user?.counts.tags).toBe(1);
      expect(user?.counts.tagged).toBe(2);
    });

    it('should remove tag', async () => {
      await userModel.tag('PUT', TEST_USER_ID, TEST_USER_ID_2, 'friend');
      await userModel.tag('DEL', TEST_USER_ID, TEST_USER_ID_2, 'friend');

      const user = await userModel.getUser(TEST_USER_ID_2);
      
      expect(user?.tags).toHaveLength(0);
      expect(user?.counts.tags).toBe(0);
      expect(user?.counts.unique_tags).toBe(0);
      expect(user?.counts.tagged).toBe(0);
    });
  });

  describe('mute', () => {
    beforeEach(async () => {
      await createTestUsers(2);
    });

    it('should mute a user', async () => {
      await userModel.mute('PUT', TEST_USER_ID, TEST_USER_ID_2);

      const user = await userModel.getUser(TEST_USER_ID);
      
      expect(user?.mutes).toContain(TEST_USER_ID_2);
      expect(user?.relationship.muted).toBe(true);
    });

    it('should unmute a user', async () => {
      await userModel.mute('PUT', TEST_USER_ID, TEST_USER_ID_2);
      await userModel.mute('DEL', TEST_USER_ID, TEST_USER_ID_2);

      const user = await userModel.getUser(TEST_USER_ID);
      
      expect(user?.mutes).not.toContain(TEST_USER_ID_2);
      expect(user?.relationship.muted).toBe(false);
    });
  });
}); 