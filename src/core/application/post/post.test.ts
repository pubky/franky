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
  });

  const createMockReplyData = (): TCreatePostInput => ({
    postId: 'author:reply123',
    content: 'This is a reply',
    kind: 'short',
    authorId: 'author' as Core.Pubky,
    postUrl: 'pubky://author/pub/pubky.app/posts/reply123',
    postJson: { content: 'This is a reply', kind: 'short' },
    parentUri: 'pubky://parent/pub/pubky.app/posts/parent123',
    attachments: undefined,
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
    it('should save locally and sync to homeserver successfully', async () => {
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
      });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, mockData.postUrl, mockData.postJson);
    });

    it('should handle reply creation with parentUri', async () => {
      const mockData = createMockReplyData();
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
      });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, mockData.postUrl, mockData.postJson);
    });

    it('should handle posts with attachments', async () => {
      const mockData: TCreatePostInput = {
        ...createMockPostData(),
        attachments: ['image1.jpg', 'image2.png'],
      };
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
      });
      expect(requestSpy).toHaveBeenCalledWith(Core.HomeserverAction.PUT, mockData.postUrl, mockData.postJson);
    });

    it('should throw when local save fails', async () => {
      const mockData = createMockPostData();
      const { saveSpy, requestSpy } = setupMocks();

      saveSpy.mockRejectedValue(new Error('Database error'));

      await expect(Post.create(mockData)).rejects.toThrow('Database error');
      expect(saveSpy).toHaveBeenCalledOnce();
      expect(requestSpy).not.toHaveBeenCalled();
    });

    it('should throw when homeserver sync fails', async () => {
      const mockData = createMockPostData();
      const { saveSpy, requestSpy } = setupMocks();

      saveSpy.mockResolvedValue(undefined);
      requestSpy.mockRejectedValue(new Error('Failed to PUT to homeserver: 500'));

      await expect(Post.create(mockData)).rejects.toThrow('Failed to PUT to homeserver: 500');
      expect(saveSpy).toHaveBeenCalledOnce();
      expect(requestSpy).toHaveBeenCalledOnce();
    });

    it('should handle long-form posts', async () => {
      const mockData: TCreatePostInput = {
        ...createMockPostData(),
        kind: 'long',
        content: 'This is a long-form post with much more content...',
      };
      const { saveSpy, requestSpy } = setupMocks();

      saveSpy.mockResolvedValue(undefined);
      requestSpy.mockResolvedValue(undefined);

      await Post.create(mockData);

      expect(saveSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'long',
          content: 'This is a long-form post with much more content...',
        }),
      );
      expect(requestSpy).toHaveBeenCalledOnce();
    });
  });
});
