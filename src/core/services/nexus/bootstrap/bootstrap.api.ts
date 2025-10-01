import * as Core from '@/core';

/**
 * Bootstrap API Endpoints
 * All API endpoints related to bootstrap operations
 */

const PREFIX = 'bootstrap';

export type TBootstrapParams = {
  pubky: string;
};

export const BOOTSTRAP_API = {
  GET: (pubky: string) => Core.buildNexusUrl(`${PREFIX}/${pubky}`),
};

export type BootstrapApiEndpoint = keyof typeof BOOTSTRAP_API;
