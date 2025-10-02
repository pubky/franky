import { describe, it, expect } from 'vitest';
import { tagApi, type TTagViewParams } from './tag.api';
import * as Config from '@/config';

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

  describe('TagApiEndpoint type', () => {
    it('should have exactly 1 endpoint', () => {
      const endpointKeys = Object.keys(tagApi);
      expect(endpointKeys).toHaveLength(1);
      expect(endpointKeys).toContain('view');
    });
  });
});
