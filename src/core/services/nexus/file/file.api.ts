import * as Core from '@/core';

/**
 * Files API Endpoints
 *
 * All API endpoints related to files operations
 */

const PREFIX = 'files';

export const FILES_API = {
  GET_AVATAR: (pubky: string) => Core.buildNexusUrl(`avatar/${pubky}`),
  GET_IMAGE: ({ pubky, file_id, variant }: Core.TImageParams) =>
    Core.buildNexusUrl(`${PREFIX}/${pubky}/${file_id}/${variant}`),
  GET_FILES: (fileUris: Core.Pubky[]) => ({
    body: buildFileBodyUrl(fileUris),
    url: Core.buildNexusUrl(`${PREFIX}/by_ids`),
  }),
};

/**
 * Files by IDs endpoint (POST request)
 * Returns both the URL and the request body for the POST request
 */
export function buildFileBodyUrl(fileUris: Core.Pubky[]) {
  // Build request body
  const body: Core.TFileBody = { uris: fileUris };
  return body;
}

export type FilesApiEndpoint = keyof typeof FILES_API;
