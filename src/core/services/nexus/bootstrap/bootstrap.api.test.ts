import { describe, it, expect } from 'vitest';
import { bootstrapApi } from './bootstrap.api';
import * as Config from '@/config';

const testPubky = 'qr3xqyz3e5cyf9npgxc5zfp15ehhcis6gqsxob4une7bwwazekry';

describe('Bootstrap API', () => {
  describe('bootstrapApi.get', () => {
    it('should generate correct URL for bootstrap', () => {
      const result = bootstrapApi.get(testPubky);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/bootstrap/${testPubky}`);
    });

    it('should handle different pubky values', () => {
      const differentPubky = 'different-pubky-123';
      const result = bootstrapApi.get(differentPubky);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/bootstrap/${differentPubky}`);
    });
  });

  describe('BootstrapApiEndpoint type', () => {
    it('should have exactly 1 endpoint', () => {
      const endpointKeys = Object.keys(bootstrapApi);
      expect(endpointKeys).toHaveLength(1);
      expect(endpointKeys).toContain('get');
    });
  });
});
