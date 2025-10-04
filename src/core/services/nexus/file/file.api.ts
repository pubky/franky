import * as Core from '@/core';

/**
 * Files API Endpoints
 *
 * All API endpoints related to files operations
 */

const PREFIX = 'files';

/**
 * Files by IDs endpoint (POST request)
 * Returns both the URL and the request body for the POST request
 */
export function buildFileBodyUrl(fileUris: Core.Pubky[]) {
  // Build request body
  const body: Core.TFileBody = { uris: fileUris };
  return body;
}

export const filesApi = {
  getAvatar: (pubky: string) => {
    const encodedPubky = Core.encodePathSegment(pubky);
    return Core.buildNexusUrl(`avatar/${encodedPubky}`);
  },
  getImage: ({ pubky, file_id, variant }: Core.TImageParams) => {
    const encodedPubky = Core.encodePathSegment(pubky);
    const encodedFileId = Core.encodePathSegment(file_id);
    return Core.buildNexusUrl(`${PREFIX}/${encodedPubky}/${encodedFileId}/${variant}`);
  },
  getFiles: (fileUris: Core.Pubky[]) => ({
    body: buildFileBodyUrl(fileUris),
    url: Core.buildNexusUrl(`${PREFIX}/by_ids`),
  }),
};

export type FilesApiEndpoint = keyof typeof filesApi;
