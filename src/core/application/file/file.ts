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
   * Uploads a file to the homeserver and persists it locally and persist it locally.
   * First uploads the blob data, then creates the file record.
   *
   * @param params - Parameters for file upload
   * @param params.blobResult - Normalized blob result
   * @param params.fileResult - Normalized file result
   */
  static async commitCreate({ fileAttachments }: Core.FilesListParams) {
    await Promise.all(
      fileAttachments.map(async (fileAttachment) => {
        const { blobResult, fileResult } = fileAttachment;
        // Upload Blob
        await Core.HomeserverService.putBlob(blobResult.meta.url, blobResult.blob.data);
        // Create File Record
        await Core.HomeserverService.request(Core.HomeserverAction.PUT, fileResult.meta.url, fileResult.file.toJson());
        // Persist Files locally
        await Core.LocalFileService.create({ blobResult, fileResult });
      }),
    );
  }

  /**
   * Commit the delete file operation, this will delete the file from the local database and sync to the homeserver.
   * @param fileAttachments - The file attachments to delete
   */
  static async commitDelete(fileAttachments: string[]) {
    await Promise.all(
      fileAttachments.map(async (fileUri) => {
        // Delete the file metadata
        await Core.HomeserverService.delete(fileUri);
        const fileCompositeId = Core.buildCompositeIdFromPubkyUri({
          uri: fileUri,
          domain: Core.CompositeIdDomain.FILES,
        });
        if (fileCompositeId) {
          const file = await Core.LocalFileService.read(fileCompositeId);
          if (file) {
            // Delete the file blob
            await Core.HomeserverService.delete(file.src);
            await Core.LocalFileService.deleteById(fileCompositeId);
          } else {
            const file = (await Core.HomeserverService.request(Core.HomeserverAction.GET, fileUri)) as { src: string };
            // Delete the file blob
            await Core.HomeserverService.delete(file.src);
          }
        }
      }),
    );
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

  static getFileUrl({ fileId, variant }: Core.TGetFileUrlParams): string {
    const { pubky, id } = Core.parseCompositeId(fileId);
    return Core.filesApi.getFileUrl({ pubky, file_id: id, variant });
  }

  /**
   * Persists files to the local database.
   * Fetches file metadata from nexus, extracts composite IDs from URIs, and saves them locally.
   *
   * @param fileUris - Array of file URIs to fetch and persist
   * @returns Promise that resolves when files are persisted
   */
  static async fetchFiles(fileUris: string[]) {
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

    await Core.LocalFileService.createMany({ files: filesWithCompositeIds as Core.NexusFileDetails[] });
  }
}
