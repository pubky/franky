import * as Core from '@/core';

export type TTagParams = Core.TPaginationParams & {
  tag: string;
};

export type TTagSearchParams = TTagParams & {
  sorting?: Core.StreamSorting;
  start?: number;
  end?: number;
};

export type TPrefixSearchParams = Core.TPaginationParams & {
  prefix: string;
};
