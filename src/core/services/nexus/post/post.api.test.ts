import { describe, it, expect } from 'vitest';
import { postApi } from './post.api';
import { type TPostViewParams, type TPostBase, type TPostTaggersParams, type TPostTagsParams } from './post.types';
import * as Config from '@/config';

const pubky = 'qr3xqyz3e5cyf9npgxc5zfp15ehhcis6gqsxob4une7bwwazekry';
const postId = 'test-post-123';

describe('Post API', () => {
  describe('postApi.view', () => {
    it('should generate correct view URL with basic parameters', () => {
      const params: TPostViewParams = {
        author_id: pubky,
        post_id: postId,
      };

      const result = postApi.view(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}`);
    });

    it('should generate correct view URL with viewer_id', () => {
      const params: TPostViewParams = {
        author_id: pubky,
        post_id: postId,
        viewer_id: `${pubky}-viewer`,
      };

      const result = postApi.view(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}?viewer_id=${pubky}-viewer`,
      );
    });

    it('should generate correct view URL with tag pagination parameters', () => {
      const params: TPostViewParams = {
        author_id: pubky,
        post_id: postId,
        limit_tags: 10,
        limit_taggers: 5,
      };

      const result = postApi.view(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}?limit_tags=10&limit_taggers=5`,
      );
    });
  });

  describe('postApi.bookmarks', () => {
    it('should generate correct bookmarks URL with basic parameters', () => {
      const params: TPostBase = {
        author_id: pubky,
        post_id: postId,
      };

      const result = postApi.bookmarks(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/bookmarks`);
    });

    it('should generate correct bookmarks URL with viewer_id', () => {
      const params: TPostBase = {
        author_id: pubky,
        post_id: postId,
        viewer_id: `${pubky}-viewer`,
      };

      const result = postApi.bookmarks(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/bookmarks?viewer_id=${pubky}-viewer`,
      );
    });
  });

  describe('postApi.counts', () => {
    it('should generate correct counts URL', () => {
      const params: TPostBase = {
        author_id: pubky,
        post_id: postId,
      };

      const result = postApi.counts(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/counts`);
    });
  });

  describe('postApi.details', () => {
    it('should generate correct details URL', () => {
      const params: TPostBase = {
        author_id: pubky,
        post_id: postId,
      };

      const result = postApi.details(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/details`);
    });
  });

  describe('postApi.taggers', () => {
    it('should generate correct taggers URL with basic parameters', () => {
      const params: TPostTaggersParams = {
        author_id: pubky,
        post_id: postId,
        label: 'test-label',
      };

      const result = postApi.taggers(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/taggers/test-label`);
    });

    it('should generate correct taggers URL with pagination parameters', () => {
      const params: TPostTaggersParams = {
        author_id: pubky,
        post_id: postId,
        label: 'test-label',
        skip: 10,
        limit: 20,
      };

      const result = postApi.taggers(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/taggers/test-label?skip=10&limit=20`,
      );
    });

    it('should generate correct taggers URL with viewer_id', () => {
      const params: TPostTaggersParams = {
        author_id: pubky,
        post_id: postId,
        label: 'test-label',
        viewer_id: `${pubky}-viewer`,
      };

      const result = postApi.taggers(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/taggers/test-label?viewer_id=${pubky}-viewer`,
      );
    });
  });

  describe('postApi.tags', () => {
    it('should generate correct tags URL with basic parameters', () => {
      const params: TPostTagsParams = {
        author_id: pubky,
        post_id: postId,
      };

      const result = postApi.tags(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/tags`);
    });

    it('should generate correct tags URL with tag pagination parameters', () => {
      const params: TPostTagsParams = {
        author_id: pubky,
        post_id: postId,
        limit_tags: 15,
        limit_taggers: 8,
        skip_tags: 5,
      };

      const result = postApi.tags(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/tags?limit_tags=15&limit_taggers=8&skip_tags=5`,
      );
    });

    it('should generate correct tags URL with viewer_id', () => {
      const params: TPostTagsParams = {
        author_id: pubky,
        post_id: postId,
        viewer_id: `${pubky}-viewer`,
      };

      const result = postApi.tags(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/post/${pubky}/${postId}/tags?viewer_id=${pubky}-viewer`,
      );
    });
  });

  describe('PostApiEndpoint type', () => {
    it('should have exactly 6 endpoints', () => {
      const endpointKeys = Object.keys(postApi);
      expect(endpointKeys).toHaveLength(6);
      expect(endpointKeys).toContain('view');
      expect(endpointKeys).toContain('bookmarks');
      expect(endpointKeys).toContain('counts');
      expect(endpointKeys).toContain('details');
      expect(endpointKeys).toContain('taggers');
      expect(endpointKeys).toContain('tags');
    });
  });
});
