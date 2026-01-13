import { describe, it, expect } from 'vitest';
import { isDynamicPublicRoute } from './routes';

describe('isDynamicPublicRoute', () => {
  describe('post routes', () => {
    it('returns true for valid single post route', () => {
      expect(isDynamicPublicRoute('/post/abc123/xyz789')).toBe(true);
    });

    it('returns true for post route with long pubky', () => {
      const longPubky = 'gujx6qd8ksydh1makdphd3bxu351d9b8waqka8hfg6q7hnqkxexo';
      expect(isDynamicPublicRoute(`/post/${longPubky}/0034BBBDFK83G`)).toBe(true);
    });

    it('returns false for incomplete post route (missing postId)', () => {
      expect(isDynamicPublicRoute('/post/abc123')).toBe(false);
    });

    it('returns false for base post route', () => {
      expect(isDynamicPublicRoute('/post')).toBe(false);
    });

    it('returns false for post route with extra segments', () => {
      expect(isDynamicPublicRoute('/post/abc123/xyz789/extra')).toBe(false);
    });
  });

  describe('profile routes', () => {
    it('returns true for profile with long pubky', () => {
      const longPubky = 'gujx6qd8ksydh1makdphd3bxu351d9b8waqka8hfg6q7hnqkxexo';
      expect(isDynamicPublicRoute(`/profile/${longPubky}`)).toBe(true);
    });

    it('returns true for profile with pubky and sub-route', () => {
      const longPubky = 'gujx6qd8ksydh1makdphd3bxu351d9b8waqka8hfg6q7hnqkxexo';
      expect(isDynamicPublicRoute(`/profile/${longPubky}/posts`)).toBe(true);
      expect(isDynamicPublicRoute(`/profile/${longPubky}/followers`)).toBe(true);
      expect(isDynamicPublicRoute(`/profile/${longPubky}/following`)).toBe(true);
    });

    it('returns false for own profile sub-routes', () => {
      expect(isDynamicPublicRoute('/profile/posts')).toBe(false);
      expect(isDynamicPublicRoute('/profile/replies')).toBe(false);
      expect(isDynamicPublicRoute('/profile/followers')).toBe(false);
      expect(isDynamicPublicRoute('/profile/following')).toBe(false);
      expect(isDynamicPublicRoute('/profile/friends')).toBe(false);
      expect(isDynamicPublicRoute('/profile/tagged')).toBe(false);
      expect(isDynamicPublicRoute('/profile/notifications')).toBe(false);
      expect(isDynamicPublicRoute('/profile/profile')).toBe(false);
    });

    it('returns false for base profile route', () => {
      expect(isDynamicPublicRoute('/profile')).toBe(false);
    });

    it('returns false for short segment that could be a route name', () => {
      // Segment must be > 20 chars to be considered a pubky
      expect(isDynamicPublicRoute('/profile/shortname')).toBe(false);
      expect(isDynamicPublicRoute('/profile/12345678901234567890')).toBe(false); // exactly 20
    });

    it('returns true for segment just over minimum length', () => {
      // 21 characters - just over the threshold
      expect(isDynamicPublicRoute('/profile/123456789012345678901')).toBe(true);
    });
  });

  describe('other routes', () => {
    it('returns false for home route', () => {
      expect(isDynamicPublicRoute('/home')).toBe(false);
    });

    it('returns false for root route', () => {
      expect(isDynamicPublicRoute('/')).toBe(false);
    });

    it('returns false for settings route', () => {
      expect(isDynamicPublicRoute('/settings')).toBe(false);
    });

    it('returns false for search route', () => {
      expect(isDynamicPublicRoute('/search')).toBe(false);
    });

    it('returns false for onboarding routes', () => {
      expect(isDynamicPublicRoute('/onboarding')).toBe(false);
      expect(isDynamicPublicRoute('/onboarding/profile')).toBe(false);
    });
  });
});
