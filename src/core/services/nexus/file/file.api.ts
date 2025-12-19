import * as Core from '@/core';

/**
 * Files API Endpoints
 *
 * All API endpoints related to files operations
 */

const API_PREFIX = 'v0/files';
const STATIC_PREFIX = 'files';

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
  getAvatarUrl: (pubky: Core.Pubky) => {
    const encodedPubky = Core.encodePathSegment(pubky);
    return Core.buildCdnUrl(`avatar/${encodedPubky}`);
  },
  getFileUrl: ({ pubky, file_id, variant }: Core.TFileParams) => {
    const encodedPubky = Core.encodePathSegment(pubky);
    const encodedFileId = Core.encodePathSegment(file_id);
    return Core.buildCdnUrl(`${STATIC_PREFIX}/${encodedPubky}/${encodedFileId}/${variant}`);
  },
  getFiles: (fileUris: Core.Pubky[]) => ({
    body: buildFileBodyUrl(fileUris),
    url: Core.buildNexusUrl(`${API_PREFIX}/by_ids`),
  }),
};

export type FilesApiEndpoint = keyof typeof filesApi;
