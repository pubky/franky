import { describe, it, expect, beforeEach } from 'vitest';
import { PubkyAppFeedLayout, PubkyAppFeedReach, PubkyAppFeedSort, PubkyAppPostKind } from 'pubky-app-specs';
import * as Core from '@/core';

describe('FeedModel', () => {
  const createFeedSchema = (overrides: Partial<Core.FeedModelSchema> = {}): Core.FeedModelSchema => ({
    id: 123,
    name: 'Bitcoin News',
    tags: ['bitcoin', 'lightning'],
    reach: PubkyAppFeedReach.All,
    sort: PubkyAppFeedSort.Recent,
    content: null,
    layout: PubkyAppFeedLayout.Columns,
    created_at: Date.now(),
    updated_at: Date.now(),
    ...overrides,
  });

  beforeEach(async () => {
    await Core.db.initialize();
    await Core.FeedModel.table.clear();
  });

  describe('CRUD operations', () => {
    it('should create a feed', async () => {
      const feed = createFeedSchema();

      await Core.FeedModel.upsert(feed);

      const saved = await Core.FeedModel.table.get(feed.id);
      expect(saved).toBeTruthy();
      expect(saved!.id).toBe(feed.id);
      expect(saved!.name).toBe(feed.name);
      expect(saved!.tags).toEqual(feed.tags);
    });

    it('should update an existing feed', async () => {
      const feed = createFeedSchema();
      await Core.FeedModel.upsert(feed);

      const updated = { ...feed, tags: ['bitcoin', 'mining'] };
      await Core.FeedModel.upsert(updated);

      const saved = await Core.FeedModel.table.get(feed.id);
      expect(saved!.tags).toEqual(['bitcoin', 'mining']);
    });

    it('should delete a feed by ID', async () => {
      const feed = createFeedSchema();
      await Core.FeedModel.upsert(feed);

      await Core.FeedModel.deleteById(feed.id);

      const saved = await Core.FeedModel.table.get(feed.id);
      expect(saved).toBeUndefined();
    });

    it('should find feed by ID', async () => {
      const feed = createFeedSchema();
      await Core.FeedModel.upsert(feed);

      const found = await Core.FeedModel.findById(feed.id);

      expect(found).toBeTruthy();
      expect(found!.id).toBe(feed.id);
    });

    it('should return null when feed not found', async () => {
      const found = await Core.FeedModel.findById(99999);

      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all feeds', async () => {
      const feed1 = createFeedSchema({ id: 1, name: 'Feed 1' });
      const feed2 = createFeedSchema({ id: 2, name: 'Feed 2' });
      const feed3 = createFeedSchema({ id: 3, name: 'Feed 3' });

      await Core.FeedModel.upsert(feed1);
      await Core.FeedModel.upsert(feed2);
      await Core.FeedModel.upsert(feed3);

      const feeds = await Core.FeedModel.findAll();

      expect(feeds).toHaveLength(3);
    });

    it('should return empty array when no feeds exist', async () => {
      const feeds = await Core.FeedModel.findAll();

      expect(feeds).toEqual([]);
    });
  });

  describe('findAllSorted', () => {
    it('should return feeds sorted by created_at descending (most recent first)', async () => {
      const now = Date.now();
      const feed1 = createFeedSchema({ id: 1, name: 'Oldest', created_at: now - 2000 });
      const feed2 = createFeedSchema({ id: 2, name: 'Middle', created_at: now - 1000 });
      const feed3 = createFeedSchema({ id: 3, name: 'Newest', created_at: now });

      // Insert in random order
      await Core.FeedModel.upsert(feed2);
      await Core.FeedModel.upsert(feed1);
      await Core.FeedModel.upsert(feed3);

      const feeds = await Core.FeedModel.findAllSorted();

      expect(feeds).toHaveLength(3);
      expect(feeds[0].name).toBe('Newest');
      expect(feeds[1].name).toBe('Middle');
      expect(feeds[2].name).toBe('Oldest');
    });
  });

  describe('findByName', () => {
    it('should find feed by name (case-insensitive)', async () => {
      const feed = createFeedSchema({ name: 'Bitcoin News' });
      await Core.FeedModel.upsert(feed);

      const foundLower = await Core.FeedModel.findByName('bitcoin news');
      const foundUpper = await Core.FeedModel.findByName('BITCOIN NEWS');
      const foundMixed = await Core.FeedModel.findByName('Bitcoin News');

      expect(foundLower).toBeTruthy();
      expect(foundUpper).toBeTruthy();
      expect(foundMixed).toBeTruthy();
    });

    it('should return undefined when name not found', async () => {
      const found = await Core.FeedModel.findByName('Nonexistent Feed');

      expect(found).toBeUndefined();
    });
  });

  describe('schema fields', () => {
    it('should store all feed configuration fields', async () => {
      const feed = createFeedSchema({
        id: 1,
        name: 'Complete Feed',
        tags: ['tag1', 'tag2', 'tag3'],
        reach: PubkyAppFeedReach.Following,
        sort: PubkyAppFeedSort.Popularity,
        content: PubkyAppPostKind.Image,
        layout: PubkyAppFeedLayout.Visual,
      });

      await Core.FeedModel.upsert(feed);
      const saved = await Core.FeedModel.table.get(feed.id);

      expect(saved!.name).toBe('Complete Feed');
      expect(saved!.tags).toEqual(['tag1', 'tag2', 'tag3']);
      expect(saved!.reach).toBe(PubkyAppFeedReach.Following);
      expect(saved!.sort).toBe(PubkyAppFeedSort.Popularity);
      expect(saved!.content).toBe(PubkyAppPostKind.Image);
      expect(saved!.layout).toBe(PubkyAppFeedLayout.Visual);
    });

    it('should handle null content (All content types)', async () => {
      const feed = createFeedSchema({ content: null });

      await Core.FeedModel.upsert(feed);
      const saved = await Core.FeedModel.table.get(feed.id);

      expect(saved!.content).toBeNull();
    });

    it('should store timestamps correctly', async () => {
      const now = Date.now();
      const feed = createFeedSchema({
        created_at: now - 1000,
        updated_at: now,
      });

      await Core.FeedModel.upsert(feed);
      const saved = await Core.FeedModel.table.get(feed.id);

      expect(saved!.created_at).toBe(now - 1000);
      expect(saved!.updated_at).toBe(now);
    });
  });
});
