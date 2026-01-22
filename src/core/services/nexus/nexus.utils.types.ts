/**
 * Nexus Internal Utility Types
 *
 * This file contains type definitions for internal utility functions
 * used by the Nexus service layer (URL building, fetch options, etc.).
 *
 * For Nexus API contract types (request/response), see `nexus.types.ts`
 */

import { HttpMethod } from '@/libs';

/**
 * Parameters for building a Nexus URL with query string.
 * @see buildUrlWithQuery in nexus.utils.ts
 */
export type TBuildUrlWithQueryParams = {
  /** Base route path (e.g., 'post/123/details') */
  baseRoute: string;
  /** Object containing all parameters to potentially include in query string */
  params: Record<string, unknown>;
  /** Keys that are path parameters and should be excluded from query string */
  excludeKeys?: readonly string[];
};

/**
 * Parameters for creating fetch request options.
 * @see createFetchOptions in nexus.utils.ts
 */
export type TCreateFetchOptionsParams = {
  /** HTTP method (defaults to GET) */
  method?: HttpMethod;
  /** Request body as JSON string */
  body?: string | null;
};

/**
 * Parameters for raw fetch requests to Nexus API.
 * @see fetchNexus in nexus.utils.ts
 */
export type TFetchNexusParams = {
  /** Full API endpoint URL */
  url: string;
  /** HTTP method (defaults to GET) */
  method?: HttpMethod;
  /** Request body as JSON string */
  body?: string | null;
};

/**
 * Parameters for querying Nexus API with retry logic.
 * @see queryNexus in nexus.utils.ts
 */
export type TQueryNexusParams = {
  /** Full API endpoint URL */
  url: string;
  /** HTTP method (defaults to GET) */
  method?: HttpMethod;
  /** Request body as JSON string */
  body?: string | null;
};
