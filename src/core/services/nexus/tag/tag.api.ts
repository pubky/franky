import * as Core from '@/core';

/**
 * Tag API Endpoints
 *
 * All API endpoints related to tag operations
 */

export type TTagViewParams = {
  taggerId: string;
  tagId: string;
};

const PREFIX = 'tags';

export const TAG_API = {
  view: (params: TTagViewParams) => Core.buildNexusUrl(`${PREFIX}/${params.taggerId}/${params.tagId}`),
};
