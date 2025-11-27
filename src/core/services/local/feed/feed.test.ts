import { describe, it, expect, beforeEach } from 'vitest';
import { PubkyAppFeedLayout, PubkyAppFeedReach, PubkyAppFeedSort } from 'pubky-app-specs';
import * as Core from '@/core';

describe('LocalFeedService', () => {
  const createFeedSchema = (overrides: Partial<Core.FeedModelSchema> = {}): Core.FeedModelSchema => ({
    id: 'feed123',
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
    it('should create a new feed', async () => {
      const feed = createFeedSchema();

      await Core.LocalFeedService.persist(feed);

      const saved = await Core.FeedModel.table.get(feed.id);
      expect(saved).toBeTruthy();
      expect(saved!.id).toBe(feed.id);
      expect(saved!.name).toBe(feed.name);
    });

    it('should update an existing feed', async () => {
      const feed = createFeedSchema();
      await Core.LocalFeedService.persist(feed);

      const updated = { ...feed, name: 'Updated Name', tags: ['newTag'] };
      await Core.LocalFeedService.persist(updated);

      const saved = await Core.FeedModel.table.get(feed.id);
      expect(saved!.name).toBe('Updated Name');
      expect(saved!.tags).toEqual(['newTag']);
    });

    it('should preserve created_at on update', async () => {
      const originalCreatedAt = Date.now() - 10000;
      const feed = createFeedSchema({ created_at: originalCreatedAt });
      await Core.LocalFeedService.persist(feed);

      const updated = { ...feed, name: 'Updated', updated_at: Date.now() };
      await Core.LocalFeedService.persist(updated);

      const saved = await Core.FeedModel.table.get(feed.id);
      expect(saved!.created_at).toBe(originalCreatedAt);
    });
  });

  describe('delete', () => {
    it('should delete a feed by ID', async () => {
      const feed = createFeedSchema();
      await Core.LocalFeedService.persist(feed);

      await Core.LocalFeedService.delete(feed.id);

      const saved = await Core.FeedModel.table.get(feed.id);
      expect(saved).toBeUndefined();
    });

    it('should not throw when deleting non-existent feed', async () => {
      // Should not throw
      await expect(Core.LocalFeedService.delete('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('findById', () => {
    it('should find feed by ID', async () => {
      const feed = createFeedSchema();
      await Core.LocalFeedService.persist(feed);

      const found = await Core.LocalFeedService.findById(feed.id);

      expect(found).toBeTruthy();
      expect(found!.id).toBe(feed.id);
      expect(found!.name).toBe(feed.name);
    });

    it('should return undefined when not found', async () => {
      const found = await Core.LocalFeedService.findById('nonexistent');

      expect(found).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all feeds sorted by created_at', async () => {
      const now = Date.now();
      const feed1 = createFeedSchema({ id: 'feed1', name: 'Oldest', created_at: now - 2000 });
      const feed2 = createFeedSchema({ id: 'feed2', name: 'Middle', created_at: now - 1000 });
      const feed3 = createFeedSchema({ id: 'feed3', name: 'Newest', created_at: now });

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
      const feeds = Array.from({ length: 5 }, (_, i) => createFeedSchema({ id: `feed${i}`, name: `Feed ${i}` }));

      await Promise.all(feeds.map((feed) => Core.LocalFeedService.persist(feed)));

      const saved = await Core.LocalFeedService.findAll();
      expect(saved).toHaveLength(5);
    });
  });
});
