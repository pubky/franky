import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Tag } from './tag';
import * as Core from '@/core';

// Mock the Local.Tag service
vi.mock('@/core/services/local/tag', () => ({
  LocalTagService: {
    save: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock the HomeserverService
vi.mock('@/core/services/homeserver', () => ({
  HomeserverService: {
    request: vi.fn(),
  },
}));

describe('Tag Application', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('create', () => {
    it('should save tag locally and sync to homeserver', async () => {
      const mockParams = {
        postId: 'author:post123',
        label: 'test-tag',
        taggerId: 'tagger123' as Core.Pubky,
        tagUrl: 'pubky://tagger123/pub/pubky.app/tags/test-tag',
        tagJson: { label: 'test-tag' },
      };

      const saveSpy = vi.spyOn(Core.Local.Tag, 'save').mockResolvedValue(undefined);
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined);

      await Tag.create(mockParams);

      expect(saveSpy).toHaveBeenCalledWith({
        postId: mockParams.postId,
        label: mockParams.label,
        taggerId: mockParams.taggerId,
      });

      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, mockParams.tagUrl, mockParams.tagJson);

      saveSpy.mockRestore();
      requestSpy.mockRestore();
    });

    it('should throw error if local save fails', async () => {
      const mockParams = {
        postId: 'author:post123',
        label: 'test-tag',
        taggerId: 'tagger123' as Core.Pubky,
        tagUrl: 'pubky://tagger123/pub/pubky.app/tags/test-tag',
        tagJson: { label: 'test-tag' },
      };

      const saveSpy = vi.spyOn(Core.Local.Tag, 'save').mockRejectedValue(new Error('Database error'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request');

      await expect(Tag.create(mockParams)).rejects.toThrow('Database error');

      expect(saveSpy).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();

      saveSpy.mockRestore();
      requestSpy.mockRestore();
    });

    it('should throw error if homeserver sync fails', async () => {
      const mockParams = {
        postId: 'author:post123',
        label: 'test-tag',
        taggerId: 'tagger123' as Core.Pubky,
        tagUrl: 'pubky://tagger123/pub/pubky.app/tags/test-tag',
        tagJson: { label: 'test-tag' },
      };

      const saveSpy = vi.spyOn(Core.Local.Tag, 'save').mockResolvedValue(undefined);
      const requestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockRejectedValue(new Error('Failed to PUT to homeserver: 500'));

      await expect(Tag.create(mockParams)).rejects.toThrow('Failed to PUT to homeserver: 500');

      expect(saveSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();

      saveSpy.mockRestore();
      requestSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('should remove tag locally and sync to homeserver', async () => {
      const mockParams = {
        postId: 'author:post123',
        label: 'test-tag',
        taggerId: 'tagger123' as Core.Pubky,
        tagUrl: 'pubky://tagger123/pub/pubky.app/tags/test-tag',
      };

      const removeSpy = vi.spyOn(Core.Local.Tag, 'remove').mockResolvedValue(undefined);
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined);

      await Tag.delete(mockParams);

      expect(removeSpy).toHaveBeenCalledWith({
        postId: mockParams.postId,
        label: mockParams.label,
        taggerId: mockParams.taggerId,
      });

      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, mockParams.tagUrl);

      removeSpy.mockRestore();
      requestSpy.mockRestore();
    });

    it('should throw error if local remove fails', async () => {
      const mockParams = {
        postId: 'author:post123',
        label: 'test-tag',
        taggerId: 'tagger123' as Core.Pubky,
        tagUrl: 'pubky://tagger123/pub/pubky.app/tags/test-tag',
      };

      const removeSpy = vi
        .spyOn(Core.Local.Tag, 'remove')
        .mockRejectedValue(new Error('User has not tagged this post with this label'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request');

      await expect(Tag.delete(mockParams)).rejects.toThrow('User has not tagged this post with this label');

      expect(removeSpy).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();

      removeSpy.mockRestore();
      requestSpy.mockRestore();
    });

    it('should throw error if homeserver sync fails', async () => {
      const mockParams = {
        postId: 'author:post123',
        label: 'test-tag',
        taggerId: 'tagger123' as Core.Pubky,
        tagUrl: 'pubky://tagger123/pub/pubky.app/tags/test-tag',
      };

      const removeSpy = vi.spyOn(Core.Local.Tag, 'remove').mockResolvedValue(undefined);
      const requestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockRejectedValue(new Error('Failed to DELETE from homeserver: 404'));

      await expect(Tag.delete(mockParams)).rejects.toThrow('Failed to DELETE from homeserver: 404');

      expect(removeSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();

      removeSpy.mockRestore();
      requestSpy.mockRestore();
    });
  });
});
