import * as Core from '@/core';

/**
 * Bootstrap API Endpoints
 * All API endpoints related to bootstrap operations
 */

const PREFIX = 'bootstrap';

export type TBootstrapParams = {
  pubky: string;
};

export const bootstrapApi = {
  get: (pubky: string) => {
    const encodedPubky = Core.encodePathSegment(pubky);
    return Core.buildNexusUrl(`${PREFIX}/${encodedPubky}`);
  },
};
