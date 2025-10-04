import { describe, it, expect } from 'vitest';
import { searchApi } from './search.api';
import { type TTagSearchParams, type TPrefixSearchParams, SEARCH_PATH_PARAMS } from './search.types';
import { StreamSorting } from '../nexus.types';
import { buildUrlWithQuery } from '../nexus.utils';
import * as Config from '@/config';

const testTag = 'test-tag';
const testPrefix = 'test-prefix';

describe('Search API', () => {
  describe('buildUrlWithQuery (used by search API)', () => {
    it('should build URL with basic parameters', () => {
      const params: TTagSearchParams = {
        tag: testTag,
        skip: 0,
        limit: 10,
      };
      const baseRoute = 'search/posts/by_tag';

      const result = buildUrlWithQuery(baseRoute, params, SEARCH_PATH_PARAMS);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/search/posts/by_tag?skip=0&limit=10`);
    });

    it('should build URL with all parameters', () => {
      const params: TTagSearchParams = {
        tag: testTag,
        skip: 5,
        limit: 20,
        sorting: StreamSorting.TIMELINE,
        start: 1000,
        end: 2000,
      };
      const baseRoute = 'search/posts/by_tag';

      const result = buildUrlWithQuery(baseRoute, params, SEARCH_PATH_PARAMS);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/search/posts/by_tag?skip=5&limit=20&sorting=timeline&start=1000&end=2000`,
      );
    });

    it('should exclude path parameters from query string', () => {
      const params: TTagSearchParams = {
        tag: testTag,
        skip: 0,
        limit: 10,
      };
      const baseRoute = 'search/posts/by_tag';

      const result = buildUrlWithQuery(baseRoute, params, SEARCH_PATH_PARAMS);
      expect(result).not.toContain('tag=');
      expect(result).toContain('skip=0');
      expect(result).toContain('limit=10');
    });

    it('should handle undefined and null values', () => {
      const params: TTagSearchParams = {
        tag: testTag,
        skip: undefined,
        limit: null as unknown as number,
        sorting: StreamSorting.TIMELINE,
      };
      const baseRoute = 'search/posts/by_tag';

      const result = buildUrlWithQuery(baseRoute, params, SEARCH_PATH_PARAMS);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/search/posts/by_tag?sorting=timeline`);
    });

    it('should handle empty parameters object', () => {
      const params: TTagSearchParams = {
        tag: testTag,
      };
      const baseRoute = 'search/posts/by_tag';

      const result = buildUrlWithQuery(baseRoute, params, SEARCH_PATH_PARAMS);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/search/posts/by_tag`);
    });
  });

  describe('searchApi.byTag', () => {
    it('should generate correct URL for tag search', () => {
      const params: TTagSearchParams = {
        tag: testTag,
        skip: 0,
        limit: 10,
      };

      const result = searchApi.byTag(params);
      expect(result).toBe(`${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/search/posts/by_tag/${testTag}?skip=0&limit=10`);
    });

    it('should generate correct URL with all parameters', () => {
      const params: TTagSearchParams = {
        tag: testTag,
        skip: 5,
        limit: 20,
        sorting: StreamSorting.TIMELINE,
        start: 1000,
        end: 2000,
      };

      const result = searchApi.byTag(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/search/posts/by_tag/${testTag}?skip=5&limit=20&sorting=timeline&start=1000&end=2000`,
      );
    });
  });

  describe('searchApi.byPrefix', () => {
    it('should generate correct URL for prefix search', () => {
      const params: TPrefixSearchParams = {
        prefix: testPrefix,
        skip: 0,
        limit: 10,
      };

      const result = searchApi.byPrefix(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/search/tags/by_prefix/${testPrefix}?skip=0&limit=10`,
      );
    });
  });

  describe('searchApi.byUser', () => {
    it('should generate correct URL for user search by ID', () => {
      const params: TPrefixSearchParams = {
        prefix: testPrefix,
        skip: 0,
        limit: 10,
      };

      const result = searchApi.byUser(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/search/users/by_id/${testPrefix}?skip=0&limit=10`,
      );
    });
  });

  describe('searchApi.byUsername', () => {
    it('should generate correct URL for username search', () => {
      const params: TPrefixSearchParams = {
        prefix: testPrefix,
        skip: 0,
        limit: 10,
      };

      const result = searchApi.byUsername(params);
      expect(result).toBe(
        `${Config.NEXUS_URL}/${Config.NEXUS_VERSION}/search/users/by_name/${testPrefix}?skip=0&limit=10`,
      );
    });
  });

  describe('SearchApiEndpoint type', () => {
    it('should have exactly 4 endpoints', () => {
      const endpointKeys = Object.keys(searchApi);
      expect(endpointKeys).toHaveLength(4);
      expect(endpointKeys).toContain('byTag');
      expect(endpointKeys).toContain('byPrefix');
      expect(endpointKeys).toContain('byUser');
      expect(endpointKeys).toContain('byUsername');
    });
  });
});
