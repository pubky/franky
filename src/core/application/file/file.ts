import * as Core from '@/core';

/**
 * File Application
 *
 * Orchestrates file operations including upload and read workflows.
 * Coordinates between homeserver (writes) and nexus (reads) services.
 */
export class FileApplication {
  private constructor() {} // Prevent instantiation

  /**
   * Uploads a file to the homeserver.
   * First uploads the blob data, then creates the file record.
   *
   * @param params - Parameters for file upload
   * @param params.blobResult - Normalized blob result
   * @param params.fileResult - Normalized file result
   */
  static async upload({ blobResult, fileResult }: Core.TUploadFileInput) {
    // 1. Upload Blob
    await Core.HomeserverService.putBlob(blobResult.meta.url, blobResult.blob.data);
    // 2. Create File Record
    await Core.HomeserverService.request(Core.HomeserverAction.PUT, fileResult.meta.url, fileResult.file.toJson());
  }

  static async getMetadata({ fileAttachments }: Core.TGetMetadataParams) {
    const compositeFileIds = fileAttachments.flatMap((uri) => {
      const compositeId = Core.buildCompositeIdFromPubkyUri({ uri, domain: Core.CompositeIdDomain.FILES });
      return compositeId ? [compositeId] : [];
    });
    const files = await Core.LocalFileService.findByIds(compositeFileIds);
    return files;
  }

  static getAvatarUrl(pubky: Core.Pubky): string {
    return Core.filesApi.getAvatarUrl(pubky);
  }

  static getImageUrl({ fileId, variant }: Core.TGetImageUrlParams): string {
    const { pubky, id } = Core.parseCompositeId(fileId);
    return Core.filesApi.getImageUrl({ pubky, file_id: id, variant });
  }

  /**
   * Persists files to the local database.
   * Fetches file metadata from nexus, extracts composite IDs from URIs, and saves them locally.
   *
   * @param fileUris - Array of file URIs to fetch and persist
   * @returns Promise that resolves when files are persisted
   */
  static async persistFiles(fileUris: string[]) {
    if (fileUris.length === 0) {
      return;
    }
    const nexusFiles = await this.fetch({ fileUris });
    const filesWithCompositeIds = nexusFiles.map((file) => {
      const compositeId = Core.buildCompositeIdFromPubkyUri({ uri: file.uri, domain: Core.CompositeIdDomain.FILES });
      return {
        ...file,
        id: compositeId,
      };
    });

    await Core.LocalFileService.persistFiles({ files: filesWithCompositeIds as Core.NexusFileDetails[] });
  }

  /**
   * Reads file metadata from nexus by file URIs.
   *
   * @param params - Parameters for reading files
   * @param params.fileUris - Array of file URIs (pubky) to fetch
   * @returns Promise resolving to file metadata from nexus
   */
  private static async fetch({ fileUris }: Core.TReadFilesInput): Promise<Core.NexusFileDetails[]> {
    const { url, body } = Core.filesApi.getFiles(fileUris);
    return (await Core.queryNexus<Core.NexusFileDetails[]>(url, 'POST', JSON.stringify(body))) ?? [];
  }
}
