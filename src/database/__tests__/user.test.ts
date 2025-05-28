import { describe, it, expect } from 'vitest';
import { UserController } from '@/database/controllers/user';
import { faker } from '@faker-js/faker';
import { NexusUser } from '@/services/nexus/types';

describe('UserController', () => {
  // Helper function to create a test user
  const createTestUser = async () => {
    const testUser: NexusUser = {
      details: {
        id: `${faker.string.uuid()}:${faker.string.uuid()}`,
        name: faker.person.fullName(),
        bio: faker.lorem.sentence(),
        links: null,
        status: null,
        image: null,
        indexed_at: Date.now(),
      },
      counts: {
        tagged: 0,
        tags: 0,
        unique_tags: 0,
        posts: 0,
        replies: 0,
        following: 0,
        followers: 0,
        friends: 0,
        bookmarks: 0,
      },
      tags: [],
      relationship: {
        following: false,
        followed_by: false,
        muted: false,
      },
    };
    return await UserController.createOrUpdate(testUser);
  };

  describe('create', () => {
    it('should create a user successfully', async () => {
      const testUser: NexusUser = {
        details: {
          id: `${faker.string.uuid()}:${faker.string.uuid()}`,
          name: faker.person.fullName(),
          bio: faker.lorem.sentence(),
          links: null,
          status: null,
          image: null,
          indexed_at: Date.now(),
        },
        counts: {
          tagged: 0,
          tags: 0,
          unique_tags: 0,
          posts: 0,
          replies: 0,
          following: 0,
          followers: 0,
          friends: 0,
          bookmarks: 0,
        },
        tags: [],
        relationship: {
          following: false,
          followed_by: false,
          muted: false,
        },
      };

      const user = await UserController.createOrUpdate(testUser);

      expect(user).toBeDefined();
      expect(user.id).toBe(testUser.details.id);
      expect(user.details.name).toBe(testUser.details.name);
      expect(user.details.bio).toBe(testUser.details.bio);
      expect(user.counts).toBeDefined();
      expect(user.tags).toHaveLength(0);
    });
  });

  describe('edit', () => {
    it('should update user details', async () => {
      const user = await createTestUser();
      const newName = faker.person.fullName();
      const newBio = faker.lorem.sentence();

      await UserController.edit({
        id: user.id,
        name: newName,
        bio: newBio,
      });

      const updatedUser = await UserController.getUser(user.id);
      expect(updatedUser.details.name).toBe(newName);
      expect(updatedUser.details.bio).toBe(newBio);
    });

    it('should throw error if user does not exist', async () => {
      await expect(
        UserController.edit({
          id: `${faker.string.uuid()}:${faker.string.uuid()}`,
          name: faker.person.fullName(),
        }),
      ).rejects.toThrow('User not found');
    });
  });

  describe('follow', () => {
    it('should create follow relationship between users', async () => {
      const follower = await createTestUser();
      const followed = await createTestUser();

      await UserController.follow('PUT', follower.id, followed.id);

      const updatedFollower = await UserController.getUser(follower.id);
      const updatedFollowed = await UserController.getUser(followed.id);

      expect(updatedFollower.following).toContain(followed.id);
      expect(updatedFollowed.followers).toContain(follower.id);
      expect(updatedFollower.counts.following).toBe(1);
      expect(updatedFollowed.counts.followers).toBe(1);
      expect(updatedFollower.counts.friends).toBe(0);
      expect(updatedFollowed.counts.friends).toBe(0);
    });

    it('should remove follow relationship between users', async () => {
      const follower = await createTestUser();
      const followed = await createTestUser();

      await UserController.follow('PUT', follower.id, followed.id);
      await UserController.follow('DEL', follower.id, followed.id);

      const updatedFollower = await UserController.getUser(follower.id);
      const updatedFollowed = await UserController.getUser(followed.id);

      expect(updatedFollower.following).not.toContain(followed.id);
      expect(updatedFollowed.followers).not.toContain(follower.id);
      expect(updatedFollower.counts.following).toBe(0);
      expect(updatedFollowed.counts.followers).toBe(0);
      expect(updatedFollower.counts.friends).toBe(0);
      expect(updatedFollowed.counts.friends).toBe(0);
    });

    it('should update friends count when both users follow each other', async () => {
      const follower = await createTestUser();
      const followed = await createTestUser();

      await UserController.follow('PUT', follower.id, followed.id);
      await UserController.follow('PUT', followed.id, follower.id);

      const updatedFollower = await UserController.getUser(follower.id);
      const updatedFollowed = await UserController.getUser(followed.id);

      expect(updatedFollower.counts.friends).toBe(1);
      expect(updatedFollowed.counts.friends).toBe(1);
    });
  });

  describe('tag', () => {
    it('should add a tag to a user', async () => {
      const tagger = await createTestUser();
      const tagged = await createTestUser();
      const tagLabel = faker.word.sample();

      await UserController.tag('PUT', tagger.id, tagged.id, tagLabel);

      const updatedTagged = await UserController.getUser(tagged.id);
      expect(updatedTagged.tags).toContainEqual(
        expect.objectContaining({
          label: tagLabel,
          taggers: [tagger.id],
          taggers_count: 1,
        }),
      );
    });

    it('should remove a tag from a user', async () => {
      const tagger = await createTestUser();
      const tagged = await createTestUser();
      const tagLabel = faker.word.sample();

      await UserController.tag('PUT', tagger.id, tagged.id, tagLabel);
      await UserController.tag('DEL', tagger.id, tagged.id, tagLabel);

      const updatedTagged = await UserController.getUser(tagged.id);
      expect(updatedTagged.tags).not.toContainEqual(
        expect.objectContaining({
          label: tagLabel,
        }),
      );
    });
  });

  describe('mute', () => {
    it('should mute a user', async () => {
      const user = await createTestUser();
      const userToMute = await createTestUser();

      await UserController.mute('PUT', user.id, userToMute.id);

      const updatedUser = await UserController.getUser(user.id);
      expect(updatedUser.mutes).toContain(userToMute.id);
      expect(updatedUser.relationship.muted).toBe(true);
    });

    it('should unmute a user', async () => {
      const user = await createTestUser();
      const userToMute = await createTestUser();

      await UserController.mute('PUT', user.id, userToMute.id);
      await UserController.mute('DEL', user.id, userToMute.id);

      const updatedUser = await UserController.getUser(user.id);
      expect(updatedUser.mutes).not.toContain(userToMute.id);
      expect(updatedUser.relationship.muted).toBe(false);
    });
  });

  describe('getTags', () => {
    it('should retrieve user tags with pagination', async () => {
      const user = await createTestUser();
      const tagger = await createTestUser();
      const tagLabels = Array.from({ length: 5 }, () => faker.word.sample());

      for (const label of tagLabels) {
        await UserController.tag('PUT', tagger.id, user.id, label);
      }

      const tags = await UserController.getTags(user.id, { skip: 0, limit: 3 });
      expect(tags).toHaveLength(3);
    });
  });

  describe('getTaggers', () => {
    it('should retrieve taggers for a specific tag', async () => {
      const tagged = await createTestUser();
      const tagger1 = await createTestUser();
      const tagger2 = await createTestUser();
      const tagLabel = faker.word.sample();

      await UserController.tag('PUT', tagger1.id, tagged.id, tagLabel);
      await UserController.tag('PUT', tagger2.id, tagged.id, tagLabel);

      const taggers = await UserController.getTaggers(tagged.id, tagLabel);
      expect(taggers).toContain(tagger1.id);
      expect(taggers).toContain(tagger2.id);
    });
  });

  describe('getFollowing and getFollowers', () => {
    it('should retrieve following list with pagination', async () => {
      const user = await createTestUser();
      const usersToFollow = await Promise.all(Array.from({ length: 5 }, () => createTestUser()));

      for (const userToFollow of usersToFollow) {
        await UserController.follow('PUT', user.id, userToFollow.id);
      }

      const following = await UserController.getFollowing(user.id, { skip: 0, limit: 3 });
      expect(following).toHaveLength(3);
    });

    it('should retrieve followers list with pagination', async () => {
      const user = await createTestUser();
      const followers = await Promise.all(Array.from({ length: 5 }, () => createTestUser()));

      for (const follower of followers) {
        await UserController.follow('PUT', follower.id, user.id);
      }

      const followersList = await UserController.getFollowers(user.id, { skip: 0, limit: 3 });
      expect(followersList).toHaveLength(3);
    });
  });

  describe('getName', () => {
    it('should retrieve user name', async () => {
      const user = await createTestUser();
      const name = await UserController.getName(user.id);
      expect(name).toBe(user.details.name);
    });

    it('should throw error if user does not exist', async () => {
      await expect(UserController.getName(`${faker.string.uuid()}:${faker.string.uuid()}`)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('getUser', () => {
    it('should retrieve a user by id', async () => {
      const user = await createTestUser();
      const retrievedUser = await UserController.getUser(user.id);
      expect(retrievedUser).toEqual(user);
    });

    it('should throw error if user does not exist', async () => {
      await expect(UserController.getUser(`${faker.string.uuid()}:${faker.string.uuid()}`)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
