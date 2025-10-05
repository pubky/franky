import { db } from '@/core/database';
import { describe, it, expect, beforeEach } from 'vitest';
import { createDefaultUserStream } from './userStream.helper';
import { UserStreamModel } from './userStream';
import { UserStreamTypes } from './userStream.types';

describe('UserStreamModel', () => {
  beforeEach(async () => {
    await db.initialize();
  });

  describe('constructor', () => {
    it('should create a user stream with all properties', () => {
      const streamData = createDefaultUserStream(UserStreamTypes.TODAY_FOLLOWERS_ALL, ['user1', 'user2']);
      const {id, stream} = new UserStreamModel(streamData);

      expect(id).toBe(UserStreamTypes.TODAY_FOLLOWERS_ALL);
      expect(stream).toEqual(['user1', 'user2']);
    });

    it('should handle empty users array', () => {
      const streamData = createDefaultUserStream(UserStreamTypes.TODAY_FOLLOWERS_ALL, []);
      const {stream} = new UserStreamModel(streamData);

      expect(stream).toEqual([]);
    });
  });

  describe('create', () => {
    it('should save user stream to database', async () => {

      await UserStreamModel.create(UserStreamTypes.TODAY_FOLLOWERS_ALL, ['user1', 'user2']);

      const foundStream = await UserStreamModel.findById(UserStreamTypes.TODAY_FOLLOWERS_ALL);
      expect(foundStream).toBeTruthy();
      expect(foundStream!.stream).toEqual(['user1', 'user2']);
    });
  });

  describe('findById', () => {
    it('should find user stream by id', async () => {
      await UserStreamModel.create(UserStreamTypes.TODAY_FOLLOWERS_ALL, ['user1', 'user2']);

      const foundStream = await UserStreamModel.findById(UserStreamTypes.TODAY_FOLLOWERS_ALL);
      expect(foundStream).toBeTruthy();
      expect(foundStream!.stream).toEqual(['user1', 'user2']);
    });

    it('should return null for non-existent stream', async () => {
      const foundStream = await UserStreamModel.findById('non-existent' as UserStreamTypes);
      expect(foundStream).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete user stream by id', async () => {
      await UserStreamModel.create(UserStreamTypes.TODAY_FOLLOWERS_ALL, ['user1', 'user2']);

      await UserStreamModel.deleteById(UserStreamTypes.TODAY_FOLLOWERS_ALL);

      const foundStream = await UserStreamModel.findById(UserStreamTypes.TODAY_FOLLOWERS_ALL);
      expect(foundStream).toBeNull();
    });
  });
});
