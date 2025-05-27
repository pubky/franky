import { beforeEach, describe, expect, it } from 'vitest';
import { UserController } from '@/database/controllers/user';
import { resetDatabase, generateTestUserId, createTestUserDetails, createTestUsers } from '@/test/helpers';
import { DEFAULT_USER_RELATIONSHIP } from '@/database/defaults';
import { DEFAULT_USER_COUNTS } from '@/database/defaults';

describe('UserModel Mutations', () => {
  const TEST_USER_ID = generateTestUserId(0);
  const TEST_USER_ID_2 = generateTestUserId(1);

  beforeEach(async () => {
    await resetDatabase();
  });

  describe('new', () => {
    it('should create a new user with default values', async () => {
      const user = await UserController.create({
        details: { id: TEST_USER_ID, indexed_at: Date.now(), name: '', bio: '', links: [], status: '', image: '' },
        counts: DEFAULT_USER_COUNTS,
        tags: [],
        relationship: DEFAULT_USER_RELATIONSHIP,
      });

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
        links: [{ url: 'https://test.com', title: 'Test' }],
      });

      const user = await UserController.create({
        details,
        counts: DEFAULT_USER_COUNTS,
        tags: [],
        relationship: DEFAULT_USER_RELATIONSHIP,
      });

      expect(user.id).toBe(TEST_USER_ID);
      expect(user.details).toMatchObject(details);
    });
  });

  describe('edit', () => {
    it('should update user details', async () => {
      await UserController.create({
        details: { id: TEST_USER_ID, indexed_at: Date.now(), name: '', bio: '', links: [], status: '', image: '' },
        counts: DEFAULT_USER_COUNTS,
        tags: [],
        relationship: DEFAULT_USER_RELATIONSHIP,
      });

      const updates = {
        name: 'Updated Name',
        bio: 'Updated Bio',
      };

      await UserController.edit({ id: TEST_USER_ID, ...updates });

      const user = await UserController.getUser(TEST_USER_ID);
      expect(user?.details.name).toBe(updates.name);
      expect(user?.details.bio).toBe(updates.bio);
    });
  });

  describe('follow', () => {
    beforeEach(async () => {
      await createTestUsers(2);
    });

    it('should create follow relationship', async () => {
      await UserController.follow('PUT', TEST_USER_ID, TEST_USER_ID_2);

      const user1 = await UserController.getUser(TEST_USER_ID);
      const user2 = await UserController.getUser(TEST_USER_ID_2);

      expect(user1?.following).toContain(TEST_USER_ID_2);
      expect(user1?.counts.following).toBe(1);
      expect(user2?.followers).toContain(TEST_USER_ID);
      expect(user2?.counts.followers).toBe(1);
    });

    it('should remove follow relationship', async () => {
      await UserController.follow('PUT', TEST_USER_ID, TEST_USER_ID_2);
      await UserController.follow('DEL', TEST_USER_ID, TEST_USER_ID_2);

      const user1 = await UserController.getUser(TEST_USER_ID);
      const user2 = await UserController.getUser(TEST_USER_ID_2);

      expect(user1?.following).not.toContain(TEST_USER_ID_2);
      expect(user1?.counts.following).toBe(0);
      expect(user2?.followers).not.toContain(TEST_USER_ID);
      expect(user2?.counts.followers).toBe(0);
    });
  });

  describe('tag', () => {
    beforeEach(async () => {
      await createTestUsers(2);
    });

    it('should add a new tag', async () => {
      await UserController.tag('PUT', TEST_USER_ID, TEST_USER_ID_2, 'friend');

      const user = await UserController.getUser(TEST_USER_ID_2);
      const tag = user?.tags[0];

      expect(tag?.label).toBe('friend');
      expect(tag?.taggers).toContain(TEST_USER_ID);
      expect(tag?.taggers_count).toBe(1);
      expect(user?.counts.tags).toBe(1);
      expect(user?.counts.unique_tags).toBe(1);
      expect(user?.counts.tagged).toBe(1);
    });

    it('should update existing tag', async () => {
      await UserController.tag('PUT', TEST_USER_ID, TEST_USER_ID_2, 'friend');

      const TEST_USER_ID_3 = generateTestUserId(2);
      await UserController.create({
        details: { id: TEST_USER_ID_3, indexed_at: Date.now(), name: '', bio: '', links: [], status: '', image: '' },
        counts: DEFAULT_USER_COUNTS,
        tags: [],
        relationship: DEFAULT_USER_RELATIONSHIP,
      });
      await UserController.tag('PUT', TEST_USER_ID_3, TEST_USER_ID_2, 'friend');

      const user = await UserController.getUser(TEST_USER_ID_2);
      const tag = user?.tags[0];

      expect(tag?.taggers).toHaveLength(2);
      expect(tag?.taggers_count).toBe(2);
      expect(user?.counts.tags).toBe(1);
      expect(user?.counts.tagged).toBe(2);
    });

    it('should remove tag', async () => {
      await UserController.tag('PUT', TEST_USER_ID, TEST_USER_ID_2, 'friend');
      await UserController.tag('DEL', TEST_USER_ID, TEST_USER_ID_2, 'friend');

      const user = await UserController.getUser(TEST_USER_ID_2);

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
      await UserController.mute('PUT', TEST_USER_ID, TEST_USER_ID_2);

      const user = await UserController.getUser(TEST_USER_ID);

      expect(user?.mutes).toContain(TEST_USER_ID_2);
      expect(user?.relationship.muted).toBe(true);
    });

    it('should unmute a user', async () => {
      await UserController.mute('PUT', TEST_USER_ID, TEST_USER_ID_2);
      await UserController.mute('DEL', TEST_USER_ID, TEST_USER_ID_2);

      const user = await UserController.getUser(TEST_USER_ID);

      expect(user?.mutes).not.toContain(TEST_USER_ID_2);
      expect(user?.relationship.muted).toBe(false);
    });
  });
});
