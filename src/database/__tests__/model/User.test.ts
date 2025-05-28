import { describe, it, expect, beforeEach, vi } from 'vitest';
import { User } from '../../model/User';
import { Tag } from '../../model/Tag';
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

describe('User Model', () => {
  // Database setup is now handled by src/test/setup.ts

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

  describe('Constructor', () => {
    it('should create a User instance with all properties', () => {
      const userData = {
        ...mockNexusUser,
        following: ['user-2'],
        followers: ['user-3'],
        muted: [],
        indexed_at: null,
        updated_at: Date.now(),
        sync_status: 'local' as const,
        sync_ttl: Date.now() + 1000,
      };

      const user = new User(userData);

      expect(user.details.id).toBe('test-user-1');
      expect(user.details.name).toBe('Test User');
      expect(user.counts.posts).toBe(5);
      expect(user.tags).toHaveLength(1);
      expect(user.tags[0]).toBeInstanceOf(Tag);
      expect(user.following).toEqual(['user-2']);
      expect(user.followers).toEqual(['user-3']);
    });

    it('should convert tags to Tag instances', () => {
      const userData = {
        ...mockNexusUser,
        following: [],
        followers: [],
        muted: [],
        indexed_at: null,
        updated_at: Date.now(),
        sync_status: 'local' as const,
        sync_ttl: Date.now() + 1000,
      };

      const user = new User(userData);

      expect(user.tags[0]).toBeInstanceOf(Tag);
      expect(user.tags[0].label).toBe('friend');
      expect(user.tags[0].taggers_count).toBe(2);
    });
  });

  describe('Database Operations', () => {
    it('should save user to database', async () => {
      const user = await User.create(mockNexusUser);

      expect(user.details.id).toBe('test-user-1');

      // Verify user is in database
      const savedUser = await User.findById('test-user-1');
      expect(savedUser).not.toBeNull();
      expect(savedUser!.details.name).toBe('Test User');
    });

    it('should delete user from database', async () => {
      const user = await User.create(mockNexusUser);

      await user.delete();

      const deletedUser = await User.findById('test-user-1');
      expect(deletedUser).toBeNull();
    });

    it('should edit user properties', async () => {
      const user = await User.create(mockNexusUser);

      await user.edit({
        details: { ...user.details, name: 'Updated Name' },
        counts: { ...user.counts, posts: 10 },
      });

      expect(user.details.name).toBe('Updated Name');
      expect(user.counts.posts).toBe(10);

      // Verify changes persisted
      const updatedUser = await User.findById('test-user-1');
      expect(updatedUser!.details.name).toBe('Updated Name');
      expect(updatedUser!.counts.posts).toBe(10);
    });
  });

  describe('Static Methods', () => {
    it('should find user by id', async () => {
      await User.create(mockNexusUser);

      const foundUser = await User.findById('test-user-1');

      expect(foundUser).not.toBeNull();
      expect(foundUser!.details.id).toBe('test-user-1');
    });

    it('should return null for non-existent user', async () => {
      const foundUser = await User.findById('non-existent');

      expect(foundUser).toBeNull();
    });

    it('should find all users', async () => {
      await User.create(mockNexusUser);
      await User.create({
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'test-user-2' },
      });

      const users = await User.findAll();

      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
    });

    it('should create new user', async () => {
      const user = await User.create(mockNexusUser);

      expect(user).toBeInstanceOf(User);
      expect(user.details.id).toBe('test-user-1');
      expect(user.sync_status).toBe('local');
      expect(user.following).toEqual([]);
      expect(user.followers).toEqual([]);
      expect(user.muted).toEqual([]);
    });
  });

  describe('Relationship Methods', () => {
    let user1: User;
    let user2: User;

    beforeEach(async () => {
      // Database is already cleared by setup.ts
      user1 = await User.create({
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'user-1' },
        counts: DEFAULT_USER_COUNTS, // Use clean counts
        tags: [],
      });
      user2 = await User.create({
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'user-2' },
        counts: DEFAULT_USER_COUNTS, // Use clean counts
        tags: [],
      });
    });

    describe('Follow', () => {
      it('should add follow relationship', async () => {
        await user1.follow('PUT', user2);

        expect(user1.following).toContain('user-2');
        expect(user1.counts.following).toBe(1);
        expect(user2.followers).toContain('user-1');
        expect(user2.counts.followers).toBe(1); // Started with 0, added 1
      });

      it('should remove follow relationship', async () => {
        await user1.follow('PUT', user2);
        await user1.follow('DEL', user2);

        expect(user1.following).not.toContain('user-2');
        expect(user1.counts.following).toBeGreaterThanOrEqual(0);
        expect(user2.followers).not.toContain('user-1');
        expect(user2.counts.followers).toBeGreaterThanOrEqual(0);
      });

      it('should handle mutual following (friends)', async () => {
        await user1.follow('PUT', user2);
        await user2.follow('PUT', user1);

        expect(user1.counts.friends).toBeGreaterThanOrEqual(1);
        expect(user2.counts.friends).toBeGreaterThanOrEqual(1);
      });
    });

    describe('Tag', () => {
      it('should add new tag', async () => {
        await user1.tag('PUT', user2, 'colleague');

        const colleagueTag = Tag.findByLabel(user2.tags, 'colleague');
        expect(colleagueTag).toBeDefined();
        expect(colleagueTag!.taggers).toContain('user-1');
        expect(user2.counts.tags).toBe(1); // Started with 0, added 1
        expect(user2.counts.unique_tags).toBe(1); // Started with 0, added 1
        expect(user1.counts.tagged).toBe(1);
      });

      it('should add tagger to existing tag', async () => {
        // First create a tag
        await user1.tag('PUT', user2, 'friend');

        // Create another user to tag the same label
        const user3 = await User.create({
          ...mockNexusUser,
          details: { ...mockNexusUser.details, id: 'user-3' },
          counts: DEFAULT_USER_COUNTS,
          tags: [],
        });

        await user3.tag('PUT', user2, 'friend');

        const friendTag = Tag.findByLabel(user2.tags, 'friend');
        expect(friendTag!.taggers).toContain('user-1');
        expect(friendTag!.taggers).toContain('user-3');
        expect(friendTag!.taggers_count).toBe(2); // 2 taggers
      });

      it('should remove tag', async () => {
        await user1.tag('PUT', user2, 'friend');
        await user1.tag('DEL', user2, 'friend');

        const friendTag = Tag.findByLabel(user2.tags, 'friend');
        expect(friendTag).toBeUndefined(); // Tag should be completely removed
      });

      it('should remove tag completely when no taggers left', async () => {
        await user1.tag('PUT', user2, 'temporary');
        await user1.tag('DEL', user2, 'temporary');

        const temporaryTag = Tag.findByLabel(user2.tags, 'temporary');
        expect(temporaryTag).toBeUndefined();
      });
    });

    describe('Mute', () => {
      it('should add mute relationship', async () => {
        await user1.mute('PUT', user2);

        expect(user1.muted).toContain('user-2');
        expect(user1.relationship.muted).toBe(true);
      });

      it('should remove mute relationship', async () => {
        await user1.mute('PUT', user2);
        await user1.mute('DEL', user2);

        expect(user1.muted).not.toContain('user-2');
        expect(user1.relationship.muted).toBe(false);
      });
    });
  });

  describe('Bulk Operations', () => {
    let sourceUser: User;
    let targetUsers: User[];

    beforeEach(async () => {
      // Database is already cleared by setup.ts
      sourceUser = await User.create({
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'source-user' },
        counts: DEFAULT_USER_COUNTS, // Use clean counts for bulk operations
        tags: [],
      });

      targetUsers = await Promise.all([
        User.create({
          ...mockNexusUser,
          details: { ...mockNexusUser.details, id: 'target-1' },
          counts: DEFAULT_USER_COUNTS,
          tags: [],
        }),
        User.create({
          ...mockNexusUser,
          details: { ...mockNexusUser.details, id: 'target-2' },
          counts: DEFAULT_USER_COUNTS,
          tags: [],
        }),
      ]);
    });

    it('should bulk follow users', async () => {
      await sourceUser.bulkFollow('PUT', targetUsers);

      expect(sourceUser.following).toContain('target-1');
      expect(sourceUser.following).toContain('target-2');
      expect(sourceUser.counts.following).toBeGreaterThanOrEqual(2);
    });

    it('should bulk tag users', async () => {
      await sourceUser.bulkTag('PUT', targetUsers, 'team');

      targetUsers.forEach((user) => {
        const teamTag = Tag.findByLabel(user.tags, 'team');
        expect(teamTag!.taggers).toContain('source-user');
      });
    });

    it('should bulk mute users', async () => {
      await sourceUser.bulkMute('PUT', targetUsers);

      expect(sourceUser.muted).toContain('target-1');
      expect(sourceUser.muted).toContain('target-2');
    });
  });

  describe('Pagination Methods', () => {
    let user: User;

    beforeEach(async () => {
      user = await User.create({
        ...mockNexusUser,
        details: { ...mockNexusUser.details, id: 'paginated-user' },
      });

      // Add some following/followers/muted for pagination
      user.following = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
      user.followers = ['follower-1', 'follower-2', 'follower-3'];
      user.muted = ['muted-1', 'muted-2'];
      await user.save();
    });

    it('should paginate following list', () => {
      const following = user.getFollowing({ skip: 1, limit: 2 });

      expect(following).toEqual(['user-2', 'user-3']);
    });

    it('should paginate followers list', () => {
      const followers = user.getFollowers({ skip: 0, limit: 2 });

      expect(followers).toEqual(['follower-1', 'follower-2']);
    });

    it('should paginate muted list', () => {
      const muted = user.getMuted({ skip: 0, limit: 1 });

      expect(muted).toEqual(['muted-1']);
    });

    it('should use default pagination', () => {
      const following = user.getFollowing();

      expect(following).toHaveLength(5); // Default limit is 20, but we only have 5
    });
  });

  describe('Tag Integration', () => {
    let user: User;

    beforeEach(async () => {
      user = await User.create({
        ...mockNexusUser,
        tags: [
          { label: 'tech', taggers: ['user-1', 'user-2'], taggers_count: 2, relationship: false },
          { label: 'news', taggers: ['user-3'], taggers_count: 1, relationship: false },
        ],
      });
    });

    it('should provide access to tag methods', () => {
      const techTag = Tag.findByLabel(user.tags, 'tech');
      expect(techTag).toBeDefined();
      expect(techTag!.taggers_count).toBe(2);
    });

    it('should allow tag manipulation', () => {
      const techTag = Tag.findByLabel(user.tags, 'tech')!;

      expect(techTag.hasUser('user-1')).toBe(true);
      expect(techTag.hasUser('user-4')).toBe(false);

      techTag.addTagger('user-4');
      expect(techTag.taggers_count).toBe(3);
      expect(techTag.hasUser('user-4')).toBe(true);
    });

    it('should get unique tag labels', () => {
      const labels = Tag.getUniqueLabels(user.tags);
      expect(labels).toEqual(['tech', 'news']);
    });

    it('should find tags by tagger', () => {
      const user1Tags = Tag.findByTagger(user.tags, 'user-1');
      expect(user1Tags).toHaveLength(1);
      expect(user1Tags[0].label).toBe('tech');
    });
  });

  describe('Instance Methods', () => {
    let user: User;

    beforeEach(async () => {
      user = await User.create(mockNexusUser);
    });

    it('should save user to database', async () => {
      user.details.name = 'Updated Name';
      await user.save();

      const savedUser = await User.findById('test-user-1');
      expect(savedUser!.details.name).toBe('Updated Name');
    });

    it('should update user properties with edit', async () => {
      await user.edit({
        details: { ...user.details, bio: 'Updated bio' },
      });

      expect(user.details.bio).toBe('Updated bio');
    });
  });
});
