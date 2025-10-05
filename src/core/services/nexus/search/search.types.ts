import * as Core from '@/core';

export type TTagParams = Core.TPaginationParams & {
  tag: string;
};

export type TTagSearchParams = TTagParams &
  Core.TPaginationRangeParams & {
    sorting?: Core.StreamSorting;
  };

export type TPrefixSearchParams = Core.TPaginationParams & {
  prefix: string;
};

export type TSearchQueryParams = Core.TTagSearchParams | Core.TPrefixSearchParams;

// Path parameters that should NOT be added to query string
export const SEARCH_PATH_PARAMS = ['tag', 'prefix'] as const;
