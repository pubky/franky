import { describe, it, expect } from 'vitest';
import { tagApi } from './tag.api';
import { TTagViewParams, TTagHotParams, TTagTaggersParams } from './tag.types';
import * as Config from '@/config';
import * as Core from '@/core';

const testTaggerId = 'qr3xqyz3e5cyf9npgxc5zfp15ehhcis6gqsxob4une7bwwazekry';
const testTagId = 'test_tag';

describe('Tag API', () => {
  describe('tagApi.view', () => {
    it('should generate correct URL for tag view', () => {
      const params: TTagViewParams = {
        taggerId: testTaggerId,
        tagId: testTagId,
      };

      const result = tagApi.view(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/tags/${testTaggerId}/${testTagId}`);
    });

    it('should handle different parameters', () => {
      const params: TTagViewParams = {
        taggerId: testTaggerId,
        tagId: 'differentTag',
      };

      const result = tagApi.view(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/tags/${testTaggerId}/differentTag`);
    });
  });

  describe('tagApi.hot', () => {
    it('should generate correct URL', () => {
      const params: TTagHotParams = {
        user_id: 'test_user',
        reach: Core.UserStreamReach.FOLLOWERS,
        limit: 20,
      };
      const result = tagApi.hot(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/tags/hot?user_id=test_user&reach=followers&limit=20`,
      );
    });
  });

  describe('tagApi.taggers', () => {
    it('should generate correct URL', () => {
      const params: TTagTaggersParams = {
        label: 'test_label',
        reach: Core.UserStreamReach.FRIENDS,
        limit: 30,
      };
      const result = tagApi.taggers(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/tags/taggers/test_label?reach=friends&limit=30`);
    });
  });

  describe('TagApiEndpoint type', () => {
    it('should have exactly 3 endpoints', () => {
      const endpointKeys = Object.keys(tagApi);
      expect(endpointKeys).toHaveLength(3);
      expect(endpointKeys).toContain('view');
      expect(endpointKeys).toContain('hot');
      expect(endpointKeys).toContain('taggers');
    });
  });
});
