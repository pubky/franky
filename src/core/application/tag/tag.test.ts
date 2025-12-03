import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagApplication } from './tag';
import * as Core from '@/core';
import type { TCreateTagInput, TDeleteTagInput } from './tag.types';

// Mock the Local.Tag service
vi.mock('@/core/services/local/tag', () => ({
  LocalTagService: {
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the HomeserverService
vi.mock('@/core/services/homeserver', () => ({
  HomeserverService: {
    request: vi.fn(),
  },
}));

describe('Tag Application', () => {
  // Test data factory
  const createMockTagData = (): TCreateTagInput => ({
    taggedId: 'author:post123',
    label: 'test-tag',
    taggerId: 'tagger123' as Core.Pubky,
    tagUrl: 'pubky://tagger123/pub/pubky.app/tags/test-tag',
    tagJson: { label: 'test-tag' },
    taggedKind: Core.TagKind.POST,
  });

  const createMockDeleteData = (): TDeleteTagInput => ({
    taggedId: 'author:post123',
    label: 'test-tag',
    taggerId: 'tagger123' as Core.Pubky,
    tagUrl: 'pubky://tagger123/pub/pubky.app/tags/test-tag',
    taggedKind: Core.TagKind.POST,
  });

  // Helper functions
  const setupMocks = () => ({
    saveSpy: vi.spyOn(Core.LocalPostTagService, 'create'),
    removeSpy: vi.spyOn(Core.LocalPostTagService, 'delete'),
    requestSpy: vi.spyOn(Core.HomeserverService, 'request'),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should save locally and sync to homeserver successfully', async () => {
      const mockData = createMockTagData();
      const { saveSpy, requestSpy } = setupMocks();

      saveSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      await TagApplication.create({ tagList: [mockData] });

      expect(saveSpy).toHaveBeenCalledWith({
        taggedId: mockData.taggedId,
        label: mockData.label,
        taggerId: mockData.taggerId,
      });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, mockData.tagUrl, mockData.tagJson);
    });

    it('should throw when local save fails', async () => {
      const mockData = createMockTagData();
      const { saveSpy, requestSpy } = setupMocks();

      saveSpy.mockRejectedValue(new Error('Database error'));

      await expect(TagApplication.create({ tagList: [mockData] })).rejects.toThrow('Database error');
      expect(saveSpy).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should throw when homeserver sync fails', async () => {
      const mockData = createMockTagData();
      const { saveSpy, requestSpy } = setupMocks();

      saveSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to PUT to homeserver: 500'));

      await expect(TagApplication.create({ tagList: [mockData] })).rejects.toThrow('Failed to PUT to homeserver: 500');
      expect(saveSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    it('should remove locally and sync to homeserver successfully', async () => {
      const mockData = createMockDeleteData();
      const { removeSpy, requestSpy } = setupMocks();

      removeSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      await TagApplication.delete(mockData);

      expect(removeSpy).toHaveBeenCalledWith({
        taggedId: mockData.taggedId,
        label: mockData.label,
        taggerId: mockData.taggerId,
      });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, mockData.tagUrl);
    });

    it('should throw when local remove fails', async () => {
      const mockData = createMockDeleteData();
      const { removeSpy, requestSpy } = setupMocks();

      removeSpy.mockRejectedValue(new Error('User has not tagged this post with this label'));

      await expect(TagApplication.delete(mockData)).rejects.toThrow('User has not tagged this post with this label');
      expect(removeSpy).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should throw when homeserver sync fails', async () => {
      const mockData = createMockDeleteData();
      const { removeSpy, requestSpy } = setupMocks();

      removeSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to DELETE from homeserver: 404'));

      await expect(TagApplication.delete(mockData)).rejects.toThrow('Failed to DELETE from homeserver: 404');
      expect(removeSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });

  describe('search', () => {
    it('should delegate to NexusTagService.search', async () => {
      const mockTags = ['developer', 'design', 'devops'];
      const searchSpy = vi.spyOn(Core.NexusTagService, 'search').mockResolvedValue(mockTags);

      const result = await TagApplication.search({ prefix: 'dev', limit: 10 });

      expect(result).toEqual(mockTags);
      expect(searchSpy).toHaveBeenCalledWith({ prefix: 'dev', limit: 10 });
    });

    it('should return empty array when no tags found', async () => {
      vi.spyOn(Core.NexusTagService, 'search').mockResolvedValue([]);

      const result = await TagApplication.search({ prefix: 'nonexistent' });

      expect(result).toEqual([]);
    });

    it('should propagate errors from service layer', async () => {
      vi.spyOn(Core.NexusTagService, 'search').mockRejectedValue(new Error('Network error'));

      await expect(TagApplication.search({ prefix: 'test' })).rejects.toThrow('Network error');
    });
  });
});
