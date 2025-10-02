import { describe, it, expect } from 'vitest';
import { userApi, buildUserBaseUrlWithParams } from './user.api';
import {
  TUserViewParams,
  TUserPaginationParams,
  TUserRelationshipParams,
  TUserTaggersParams,
  TUserTagsParams,
} from './user.types';
import * as Core from '@/core';
import * as Config from '@/config';

const testUserId = 'qr3xqyz3e5cyf9npgxc5zfp15ehhcis6gqsxob4une7bwwazekry';
const testViewerId = 'viewer123';

describe('User API', () => {
  describe('buildUserBaseUrlWithParams', () => {
    it('should build URL with basic parameters', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 2,
        viewer_id: testViewerId,
      };
      const baseRoute = 'user/test';

      const result = buildUserBaseUrlWithParams(params, baseRoute);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/test?depth=2&viewer_id=${testViewerId}`);
    });

    it('should exclude path parameters from query string', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 1,
      };
      const baseRoute = 'user/test';

      const result = buildUserBaseUrlWithParams(params, baseRoute);
      expect(result).not.toContain('user_id=');
      expect(result).toContain('depth=1');
    });
  });

  describe('USER_API endpoints', () => {
    it('should generate correct URLs for basic endpoints', () => {
      const params: Core.TUserId = { user_id: testUserId };

      expect(userApi.counts(params)).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/counts`);
      expect(userApi.details(params)).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/details`);
    });

    it('should generate correct URLs for view endpoints', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 2,
        viewer_id: testViewerId,
      };

      expect(userApi.view(params)).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}?depth=2&viewer_id=${testViewerId}`,
      );
      expect(userApi.followers(params)).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/followers?depth=2&viewer_id=${testViewerId}`,
      );
      expect(userApi.following(params)).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/following?depth=2&viewer_id=${testViewerId}`,
      );
    });

    it('should generate correct URLs for relationship endpoint', () => {
      const params: TUserRelationshipParams = {
        user_id: testUserId,
        viewer_id: testViewerId,
      };

      expect(userApi.relationship(params)).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/relationship/${testViewerId}`,
      );
    });

    it('should generate correct URL for friends endpoint', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 2,
        viewer_id: testViewerId,
      };

      expect(userApi.friends(params)).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/friends?depth=2&viewer_id=${testViewerId}`,
      );
    });

    it('should generate correct URL for muted endpoint', () => {
      const params: TUserViewParams = {
        user_id: testUserId,
        depth: 2,
        viewer_id: testViewerId,
      };

      expect(userApi.muted(params)).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/muted?depth=2&viewer_id=${testViewerId}`,
      );
    });

    it('should generate correct URL for notifications endpoint', () => {
      const params: TUserPaginationParams = {
        user_id: testUserId,
        skip: 0,
        limit: 10,
        start: 1000,
        end: 2000,
      };

      expect(userApi.notifications(params)).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/notifications?skip=0&limit=10&start=1000&end=2000`,
      );
    });

    it('should generate correct URL for taggers endpoint', () => {
      const params: TUserTaggersParams = {
        user_id: testUserId,
        label: 'test-tag',
        skip: 0,
        limit: 10,
      };

      expect(userApi.taggers(params)).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/taggers/test-tag?skip=0&limit=10`,
      );
    });

    it('should generate correct URL for tags endpoint', () => {
      const params: TUserTagsParams = {
        user_id: testUserId,
        skip_tags: 0,
        limit_tags: 10,
      };

      expect(userApi.tags(params)).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/user/${testUserId}/tags?skip_tags=0&limit_tags=10`,
      );
    });
  });

  describe('UserApiEndpoint type', () => {
    it('should have exactly 11 endpoints', () => {
      const endpointKeys = Object.keys(userApi);
      expect(endpointKeys).toHaveLength(11);
      expect(endpointKeys).toContain('view');
      expect(endpointKeys).toContain('counts');
      expect(endpointKeys).toContain('details');
      expect(endpointKeys).toContain('followers');
      expect(endpointKeys).toContain('following');
      expect(endpointKeys).toContain('friends');
      expect(endpointKeys).toContain('muted');
      expect(endpointKeys).toContain('notifications');
      expect(endpointKeys).toContain('relationship');
      expect(endpointKeys).toContain('taggers');
      expect(endpointKeys).toContain('tags');
    });
  });
});
