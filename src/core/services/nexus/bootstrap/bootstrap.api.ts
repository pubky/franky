import * as Core from '@/core';

export type { BootstrapApiEndpoint } from './bootstrap.types';

/**
 * Bootstrap API Endpoints
 * All API endpoints related to bootstrap operations
 */

const PREFIX = 'v0/bootstrap';

export const bootstrapApi = {
  get: (pubky: string): string => {
    const encodedPubky = Core.encodePathSegment(pubky);
    return Core.buildNexusUrl(`${PREFIX}/${encodedPubky}`);
  },
};
