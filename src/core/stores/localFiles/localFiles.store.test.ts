import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocalFilesStore } from './localFiles.store';

describe('LocalFilesStore', () => {
  // Mock URL.revokeObjectURL to track calls
  const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

  beforeEach(() => {
    // Reset the store to initial state before each test
    useLocalFilesStore.setState({ profile: null, posts: {} });
    revokeObjectURLSpy.mockClear();
  });

  describe('Initial State', () => {
    it('should have profile set to null initially', () => {
      const state = useLocalFilesStore.getState();
      expect(state.profile).toBeNull();
    });

    it('should have posts set to empty object initially', () => {
      const state = useLocalFilesStore.getState();
      expect(state.posts).toEqual({});
    });
  });

  describe('setProfile', () => {
    it('should set profile blob URL', () => {
      useLocalFilesStore.getState().setProfile('blob:http://localhost/abc123');
      expect(useLocalFilesStore.getState().profile).toBe('blob:http://localhost/abc123');
    });

    it('should clear profile when set to null', () => {
      useLocalFilesStore.getState().setProfile('blob:http://localhost/abc123');
      useLocalFilesStore.getState().setProfile(null);
      expect(useLocalFilesStore.getState().profile).toBeNull();
    });

    it('should revoke previous blob URL when setting new one', () => {
      const oldBlobUrl = 'blob:http://localhost/old123';
      const newBlobUrl = 'blob:http://localhost/new456';

      useLocalFilesStore.getState().setProfile(oldBlobUrl);
      revokeObjectURLSpy.mockClear(); // Clear the call from initial set

      useLocalFilesStore.getState().setProfile(newBlobUrl);

      expect(revokeObjectURLSpy).toHaveBeenCalledWith(oldBlobUrl);
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
    });

    it('should revoke previous blob URL when setting to null', () => {
      const oldBlobUrl = 'blob:http://localhost/old123';

      useLocalFilesStore.getState().setProfile(oldBlobUrl);
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().setProfile(null);

      expect(revokeObjectURLSpy).toHaveBeenCalledWith(oldBlobUrl);
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(1);
    });

    it('should not revoke non-blob URLs', () => {
      const httpUrl = 'https://example.com/avatar.png';

      useLocalFilesStore.getState().setProfile(httpUrl);
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().setProfile('blob:http://localhost/new456');

      // Should not revoke the http URL
      expect(revokeObjectURLSpy).not.toHaveBeenCalledWith(httpUrl);
    });

    it('should not call revokeObjectURL when previous value is null', () => {
      useLocalFilesStore.getState().setProfile('blob:http://localhost/abc123');
      expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    });
  });

  describe('setPostAttachments', () => {
    const postId = 'pk:abc123/posts/xyz789';
    const blobUrls = ['blob:http://localhost/attach1', 'blob:http://localhost/attach2'];

    it('should set post attachments', () => {
      useLocalFilesStore.getState().setPostAttachments(postId, blobUrls);
      expect(useLocalFilesStore.getState().posts[postId]).toEqual(blobUrls);
    });

    it('should remove post key when setting empty array', () => {
      useLocalFilesStore.getState().setPostAttachments(postId, blobUrls);
      useLocalFilesStore.getState().setPostAttachments(postId, []);
      expect(useLocalFilesStore.getState().posts[postId]).toBeUndefined();
      expect(postId in useLocalFilesStore.getState().posts).toBe(false);
    });

    it('should revoke previous blob URLs when setting new attachments', () => {
      const oldUrls = ['blob:http://localhost/old1', 'blob:http://localhost/old2'];
      const newUrls = ['blob:http://localhost/new1'];

      useLocalFilesStore.getState().setPostAttachments(postId, oldUrls);
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().setPostAttachments(postId, newUrls);

      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/old1');
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/old2');
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(2);
    });

    it('should revoke previous blob URLs when clearing attachments', () => {
      useLocalFilesStore.getState().setPostAttachments(postId, blobUrls);
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().setPostAttachments(postId, []);

      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/attach1');
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/attach2');
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple posts independently', () => {
      const postId2 = 'pk:abc123/posts/def456';
      const urls2 = ['blob:http://localhost/other'];

      useLocalFilesStore.getState().setPostAttachments(postId, blobUrls);
      useLocalFilesStore.getState().setPostAttachments(postId2, urls2);

      expect(useLocalFilesStore.getState().posts[postId]).toEqual(blobUrls);
      expect(useLocalFilesStore.getState().posts[postId2]).toEqual(urls2);
    });

    it('should not revoke when no previous attachments exist', () => {
      useLocalFilesStore.getState().setPostAttachments(postId, blobUrls);
      expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset profile to null', () => {
      useLocalFilesStore.getState().setProfile('blob:http://localhost/profile');
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().reset();

      expect(useLocalFilesStore.getState().profile).toBeNull();
    });

    it('should reset posts to empty object', () => {
      useLocalFilesStore.getState().setPostAttachments('post1', ['blob:http://localhost/a']);
      useLocalFilesStore.getState().setPostAttachments('post2', ['blob:http://localhost/b']);
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().reset();

      expect(useLocalFilesStore.getState().posts).toEqual({});
    });

    it('should revoke profile blob URL on reset', () => {
      const profileUrl = 'blob:http://localhost/profile';
      useLocalFilesStore.getState().setProfile(profileUrl);
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().reset();

      expect(revokeObjectURLSpy).toHaveBeenCalledWith(profileUrl);
    });

    it('should revoke all post attachment blob URLs on reset', () => {
      const urls1 = ['blob:http://localhost/post1-a', 'blob:http://localhost/post1-b'];
      const urls2 = ['blob:http://localhost/post2-a'];

      useLocalFilesStore.getState().setPostAttachments('post1', urls1);
      useLocalFilesStore.getState().setPostAttachments('post2', urls2);
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().reset();

      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/post1-a');
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/post1-b');
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/post2-a');
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(3);
    });

    it('should revoke both profile and post URLs on reset', () => {
      const profileUrl = 'blob:http://localhost/profile';
      const postUrls = ['blob:http://localhost/post'];

      useLocalFilesStore.getState().setProfile(profileUrl);
      useLocalFilesStore.getState().setPostAttachments('post1', postUrls);
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().reset();

      expect(revokeObjectURLSpy).toHaveBeenCalledWith(profileUrl);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/post');
      expect(revokeObjectURLSpy).toHaveBeenCalledTimes(2);
    });

    it('should not call revokeObjectURL for non-blob URLs', () => {
      useLocalFilesStore.setState({
        profile: 'https://example.com/avatar.png',
        posts: { post1: ['https://example.com/attach.png'] },
      });
      revokeObjectURLSpy.mockClear();

      useLocalFilesStore.getState().reset();

      expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    });

    it('should handle reset when store is already empty', () => {
      useLocalFilesStore.getState().reset();

      expect(useLocalFilesStore.getState().profile).toBeNull();
      expect(useLocalFilesStore.getState().posts).toEqual({});
      expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    });
  });
});
