import { describe, it, expect, beforeEach } from 'vitest';
import { PubkyAppFeedLayout, PubkyAppFeedReach, PubkyAppFeedSort } from 'pubky-app-specs';
import * as Core from '@/core';

describe('LocalFeedService', () => {
  const createFeedSchema = (overrides: Partial<Core.FeedModelSchema> = {}): Core.FeedModelSchema => ({
    id: 0, // 0 for new feeds (auto-increment), or existing numeric ID for updates
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

  describe('persist', () => {
    it('should create a new feed with auto-incrementing ID', async () => {
      const feed = createFeedSchema({ id: 0 }); // 0 triggers auto-increment

      const persistedFeed = await Core.LocalFeedService.persist(feed);

      expect(persistedFeed).toBeTruthy();
      expect(persistedFeed.id).toBeGreaterThan(0); // Auto-generated ID
      expect(persistedFeed.name).toBe(feed.name);

      // Verify it was saved correctly
      const saved = await Core.FeedModel.table.get(persistedFeed.id);
      expect(saved).toBeTruthy();
      expect(saved!.id).toBe(persistedFeed.id);
    });

    it('should update an existing feed', async () => {
      // Create feed first (auto-increment)
      const feed = createFeedSchema({ id: 0 });
      const createdFeed = await Core.LocalFeedService.persist(feed);

      // Update with existing ID
      const updated = { ...createdFeed, name: 'Updated Name', tags: ['newTag'] };
      const updatedFeed = await Core.LocalFeedService.persist(updated);

      expect(updatedFeed.id).toBe(createdFeed.id); // Same ID
      expect(updatedFeed.name).toBe('Updated Name');
      expect(updatedFeed.tags).toEqual(['newTag']);
    });

    it('should preserve created_at on update', async () => {
      const originalCreatedAt = Date.now() - 10000;
      const feed = createFeedSchema({ id: 0, created_at: originalCreatedAt });
      const createdFeed = await Core.LocalFeedService.persist(feed);

      const updated = { ...createdFeed, name: 'Updated', updated_at: Date.now() };
      const updatedFeed = await Core.LocalFeedService.persist(updated);

      expect(updatedFeed.created_at).toBe(originalCreatedAt);
      expect(updatedFeed.updated_at).toBeGreaterThan(originalCreatedAt);
    });

    it('should handle multiple feeds with auto-incrementing IDs', async () => {
      const feed1 = createFeedSchema({ id: 0, name: 'Feed 1' });
      const feed2 = createFeedSchema({ id: 0, name: 'Feed 2' });
      const feed3 = createFeedSchema({ id: 0, name: 'Feed 3' });

      const persisted1 = await Core.LocalFeedService.persist(feed1);
      const persisted2 = await Core.LocalFeedService.persist(feed2);
      const persisted3 = await Core.LocalFeedService.persist(feed3);

      // All should have unique auto-generated IDs
      expect(persisted1.id).toBeGreaterThan(0);
      expect(persisted2.id).toBeGreaterThan(0);
      expect(persisted3.id).toBeGreaterThan(0);
      expect(persisted1.id).not.toBe(persisted2.id);
      expect(persisted2.id).not.toBe(persisted3.id);
    });
  });

  describe('delete', () => {
    it('should delete a feed by ID', async () => {
      const feed = createFeedSchema({ id: 0 });
      const persistedFeed = await Core.LocalFeedService.persist(feed);

      await Core.LocalFeedService.delete(persistedFeed.id);

      const saved = await Core.FeedModel.table.get(persistedFeed.id);
      expect(saved).toBeUndefined();
    });

    it('should not throw when deleting non-existent feed', async () => {
      // Should not throw
      await expect(Core.LocalFeedService.delete(99999)).resolves.not.toThrow();
    });
  });

  describe('findById', () => {
    it('should find feed by ID', async () => {
      const feed = createFeedSchema({ id: 0 });
      const persistedFeed = await Core.LocalFeedService.persist(feed);

      const found = await Core.LocalFeedService.findById(persistedFeed.id);

      expect(found).toBeTruthy();
      expect(found!.id).toBe(persistedFeed.id);
      expect(found!.name).toBe(feed.name);
    });

    it('should return undefined when not found', async () => {
      const found = await Core.LocalFeedService.findById(99999);

      expect(found).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all feeds sorted by created_at', async () => {
      const now = Date.now();
      const feed1 = createFeedSchema({ id: 0, name: 'Oldest', created_at: now - 2000 });
      const feed2 = createFeedSchema({ id: 0, name: 'Middle', created_at: now - 1000 });
      const feed3 = createFeedSchema({ id: 0, name: 'Newest', created_at: now });

      await Core.LocalFeedService.persist(feed2);
      await Core.LocalFeedService.persist(feed1);
      await Core.LocalFeedService.persist(feed3);

      const feeds = await Core.LocalFeedService.findAll();

      expect(feeds).toHaveLength(3);
      expect(feeds[0].name).toBe('Newest');
      expect(feeds[1].name).toBe('Middle');
      expect(feeds[2].name).toBe('Oldest');
    });

    it('should return empty array when no feeds exist', async () => {
      const feeds = await Core.LocalFeedService.findAll();

      expect(feeds).toEqual([]);
    });
  });

  describe('transaction safety', () => {
    it('should handle multiple concurrent persists', async () => {
      const feeds = Array.from({ length: 5 }, (_, i) => createFeedSchema({ id: 0, name: `Feed ${i}` }));

      const persistedFeeds = await Promise.all(feeds.map((feed) => Core.LocalFeedService.persist(feed)));

      // All should have unique auto-generated IDs
      const ids = persistedFeeds.map((f) => f.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);

      const saved = await Core.LocalFeedService.findAll();
      expect(saved).toHaveLength(5);
    });
  });
});
