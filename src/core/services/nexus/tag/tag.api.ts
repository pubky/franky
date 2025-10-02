import * as Core from '@/core';

/**
 * Tag API Endpoints
 *
 * All API endpoints related to tag operations
 */

export type TTagViewParams = {
  taggerId: Core.Pubky;
  tagId: string;
};

const PREFIX = 'tags';

export const tagApi = {
  view: (params: TTagViewParams) => Core.buildNexusUrl(`${PREFIX}/${params.taggerId}/${params.tagId}`),
};
