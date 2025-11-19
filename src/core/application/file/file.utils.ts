import * as Core from '@/core';

/**
 *
 * Fetches file metadata from nexus and persists them to the local database.
 * Builds composite IDs from file URIs and saves files locally.
 *
 * This is a shared helper function used by both FileApplication and PostStreamApplication
 * to avoid code duplication.
 *
 * @param fileUris - Array of file URIs to fetch and persist
 * @returns Promise that resolves when files are persisted
 *
 * ANTIPATTERN: This is a shared helper function used by both FileApplication and PostStreamApplication
 * Post stream applicationis calling indirectly to file application domain still breaks the single responsibility principle.
 */
export async function persistFilesFromUris(fileUris: string[]): Promise<void> {
  if (fileUris.length === 0) {
    return;
  }

  const nexusFiles = await Core.NexusFileService.fetchFiles(fileUris);
  const filesWithCompositeIds = nexusFiles.map((file) => {
    const compositeId = Core.buildCompositeIdFromPubkyUri({
      uri: file.uri,
      domain: Core.CompositeIdDomain.FILES,
    });
    return {
      ...file,
      urls: JSON.parse(file.urls as unknown as string) as Core.NexusFileUrls,
      id: compositeId,
    };
  });

  await Core.LocalFileService.persistFiles({ files: filesWithCompositeIds as Core.NexusFileDetails[] });
}
