import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Post } from './post';
import * as Core from '@/core';
import type { TCreatePostInput } from './post.types';

// Mock the Local.Post service
vi.mock('@/core/services/local/post', () => ({
  LocalPostService: {
    fetch: vi.fn(),
    create: vi.fn(),
  },
}));

// Mock the HomeserverService
vi.mock('@/core/services/homeserver', () => ({
  HomeserverService: {
    request: vi.fn(),
  },
}));

describe('Post Application', () => {
  // Test data factory
  const createMockPostData = (): TCreatePostInput => ({
    postId: 'author:post123',
    content: 'Hello, world!',
    kind: 'short',
    authorId: 'author' as Core.Pubky,
    postUrl: 'pubky://author/pub/pubky.app/posts/post123',
    postJson: { content: 'Hello, world!', kind: 'short' },
    parentUri: undefined,
    attachments: undefined,
    repostedUri: undefined,
  });

  // Helper functions
  const setupMocks = () => ({
    saveSpy: vi.spyOn(Core.Local.Post, 'create'),
    requestSpy: vi.spyOn(Core.HomeserverService, 'request'),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should save post locally and sync to homeserver', async () => {
      const mockData = createMockPostData();
      const { saveSpy, requestSpy } = setupMocks();

      saveSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      await Post.create(mockData);

      expect(saveSpy).toHaveBeenCalledWith({
        postId: mockData.postId,
        content: mockData.content,
        kind: mockData.kind,
        authorId: mockData.authorId,
        parentUri: mockData.parentUri,
        attachments: mockData.attachments,
        repostedUri: mockData.repostedUri,
      });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, mockData.postUrl, mockData.postJson);
    });

    it('should propagate error when local save fails', async () => {
      const mockData = createMockPostData();
      const { saveSpy, requestSpy } = setupMocks();

      saveSpy.mockRejectedValue(new Error('Database error'));

      await expect(Post.create(mockData)).rejects.toThrow('Database error');
      expect(saveSpy).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should propagate error when homeserver sync fails', async () => {
      const mockData = createMockPostData();
      const { saveSpy, requestSpy } = setupMocks();

      saveSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to PUT to homeserver: 500'));

      await expect(Post.create(mockData)).rejects.toThrow('Failed to PUT to homeserver: 500');
      expect(saveSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });

  describe('delete', () => {
    const createMockDeleteData = () => ({
      postId: 'author:post123',
      deleterId: 'author' as Core.Pubky,
    });

    const mockPostDetails = {
      id: 'author:post123',
      content: 'Test post',
      kind: 'short' as const,
      uri: 'pubky://author/pub/pubky.app/posts/post123',
      indexed_at: Date.now(),
      attachments: null,
    };

    it('should fetch post, delete locally and sync to homeserver', async () => {
      const mockData = createMockDeleteData();
      const findByIdSpy = vi.spyOn(Core.PostDetailsModel, 'findById').mockResolvedValue(mockPostDetails);
      const deleteSpy = vi.spyOn(Core.Local.Post, 'delete').mockResolvedValue(undefined);
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined);

      await Post.delete(mockData);

      expect(findByIdSpy).toHaveBeenCalledWith(mockData.postId);
      expect(deleteSpy).toHaveBeenCalledWith({
        postId: mockData.postId,
        deleterId: mockData.deleterId,
      });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.DELETE, mockPostDetails.uri);
    });

    it('should throw error when post not found', async () => {
      const mockData = createMockDeleteData();
      const findByIdSpy = vi.spyOn(Core.PostDetailsModel, 'findById').mockResolvedValue(null);

      await expect(Post.delete(mockData)).rejects.toThrow('Post not found');

      expect(findByIdSpy).toHaveBeenCalledOnce();
    });

    it('should propagate error when local delete fails', async () => {
      const mockData = createMockDeleteData();
      const findByIdSpy = vi.spyOn(Core.PostDetailsModel, 'findById').mockResolvedValue(mockPostDetails);
      const deleteSpy = vi.spyOn(Core.Local.Post, 'delete').mockRejectedValue(new Error('local-delete-fail'));
      const requestSpy = vi.spyOn(Core.HomeserverService, 'request').mockResolvedValue(undefined);

      await expect(Post.delete(mockData)).rejects.toThrow('local-delete-fail');

      expect(findByIdSpy).toHaveBeenCalledOnce();
      expect(deleteSpy).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should propagate error when homeserver delete fails', async () => {
      const mockData = createMockDeleteData();
      const findByIdSpy = vi.spyOn(Core.PostDetailsModel, 'findById').mockResolvedValue(mockPostDetails);
      const deleteSpy = vi.spyOn(Core.Local.Post, 'delete').mockResolvedValue(undefined);
      const requestSpy = vi
        .spyOn(Core.HomeserverService, 'request')
        .mockRejectedValue(new Error('Failed to DELETE from homeserver: 500'));

      await expect(Post.delete(mockData)).rejects.toThrow('Failed to DELETE from homeserver: 500');

      expect(findByIdSpy).toHaveBeenCalledOnce();
      expect(deleteSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });
});
