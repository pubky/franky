import { describe, it, expect, beforeEach } from 'vitest';
import * as Core from '@/core';

describe('PostDetailsModel', () => {
  beforeEach(async () => {
    await Core.resetDatabase();
  });

  const testPostId1 = 'post-test-1';
  const testPostId2 = 'post-test-2';
  const testAuthor = 'test-author-pubky';

  const MOCK_NEXUS_POST_DETAILS: Omit<Core.NexusPostDetails, 'id'> = {
    content: 'This is a test post content',
    indexed_at: Date.now(),
    author: testAuthor,
    kind: 'short',
    uri: 'https://example.com/post/1',
    attachments: ['image1.jpg', 'image2.png'],
  };

  describe('Constructor', () => {
    it('should create PostDetailsModel instance with all properties', () => {
      const mockPostDetailsData = {
        id: testPostId1,
        ...MOCK_NEXUS_POST_DETAILS,
      };

      const postDetails = new Core.PostDetailsModel(mockPostDetailsData);

      expect(postDetails.id).toBe(mockPostDetailsData.id);
      expect(postDetails.content).toBe(mockPostDetailsData.content);
      expect(postDetails.indexed_at).toBe(mockPostDetailsData.indexed_at);
      expect(postDetails.author).toBe(mockPostDetailsData.author);
      expect(postDetails.kind).toBe(mockPostDetailsData.kind);
      expect(postDetails.uri).toBe(mockPostDetailsData.uri);
      expect(postDetails.attachments).toEqual(mockPostDetailsData.attachments);
    });

    it('should handle null attachments', () => {
      const mockPostDetailsData = {
        id: testPostId1,
        ...MOCK_NEXUS_POST_DETAILS,
        attachments: null,
      };

      const postDetails = new Core.PostDetailsModel(mockPostDetailsData);

      expect(postDetails.attachments).toBeNull();
    });
  });

  describe('Static Methods', () => {
    it('should insert post details', async () => {
      const mockPostDetailsData = {
        id: testPostId1,
        ...MOCK_NEXUS_POST_DETAILS,
      };

      const result = await Core.PostDetailsModel.insert(mockPostDetailsData);
      expect(result).toBeDefined();
    });

    it('should find post details by id', async () => {
      const mockPostDetailsData = {
        id: testPostId1,
        ...MOCK_NEXUS_POST_DETAILS,
      };

      await Core.PostDetailsModel.insert(mockPostDetailsData);
      const result = await Core.PostDetailsModel.findById(testPostId1);

      expect(result).toBeInstanceOf(Core.PostDetailsModel);
      expect(result.id).toBe(testPostId1);
      expect(result.content).toBe(MOCK_NEXUS_POST_DETAILS.content);
      expect(result.author).toBe(MOCK_NEXUS_POST_DETAILS.author);
    });

    it('should throw error for non-existent post details', async () => {
      const nonExistentId = 'non-existent-post-999';
      await expect(Core.PostDetailsModel.findById(nonExistentId)).rejects.toThrow(`Record not found: ${nonExistentId}`);
    });

    it('should bulk save post details from tuples', async () => {
      const mockPostDetails: Core.NexusPostDetails[] = [
        { id: testPostId1, ...MOCK_NEXUS_POST_DETAILS },
        { id: testPostId2, ...MOCK_NEXUS_POST_DETAILS, content: 'Second post content' },
      ];

      const result = await Core.PostDetailsModel.bulkSave(mockPostDetails);
      expect(result).toBeDefined();

      // Verify the data was saved correctly
      const postDetails1 = await Core.PostDetailsModel.findById(testPostId1);
      const postDetails2 = await Core.PostDetailsModel.findById(testPostId2);

      expect(postDetails1.content).toBe('This is a test post content');
      expect(postDetails2.content).toBe('Second post content');
    });

    it('should handle empty array in bulk save', async () => {
      const result = await Core.PostDetailsModel.bulkSave([]);
      // bulkPut with empty array returns undefined, which is expected
      expect(result).toBeUndefined();
    });

    it('should handle different post kinds', async () => {
      const mockPostDetails: Core.NexusPostDetails[] = [
        { id: testPostId1, ...MOCK_NEXUS_POST_DETAILS, kind: 'short' },
        { id: testPostId2, ...MOCK_NEXUS_POST_DETAILS, kind: 'long' },
      ];

      await Core.PostDetailsModel.bulkSave(mockPostDetails);

      const postDetails1 = await Core.PostDetailsModel.findById(testPostId1);
      const postDetails2 = await Core.PostDetailsModel.findById(testPostId2);

      expect(postDetails1.kind).toBe('short');
      expect(postDetails2.kind).toBe('long');
    });

    it('should handle posts with and without attachments', async () => {
      const mockPostDetails: Core.NexusPostDetails[] = [
        { id: testPostId1, ...MOCK_NEXUS_POST_DETAILS, attachments: ['file1.jpg'] },
        { id: testPostId2, ...MOCK_NEXUS_POST_DETAILS, attachments: null },
      ];

      await Core.PostDetailsModel.bulkSave(mockPostDetails);

      const postDetails1 = await Core.PostDetailsModel.findById(testPostId1);
      const postDetails2 = await Core.PostDetailsModel.findById(testPostId2);

      expect(postDetails1.attachments).toEqual(['file1.jpg']);
      expect(postDetails2.attachments).toBeNull();
    });
  });
});
