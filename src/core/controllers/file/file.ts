import * as Core from '@/core';

/**
 * File Controller
 *
 * Handles file operations including upload, read, and URL generation.
 * Delegates to application layer for business logic orchestration.
 */
export class FileController {
  private constructor() {} // Prevent instantiation

  /**
   * Uploads a file to the homeserver.
   * Normalizes the file and blob, then uploads both to the homeserver.
   *
   * @param params - Parameters for file upload
   * @param params.file - The file to upload
   * @param params.pubky - User's public key
   * @returns Promise resolving to the file URL
   */
  static async upload({ file, pubky }: Core.TUploadFileParams): Promise<string> {
    const fileContent = await file.arrayBuffer();
    const blobData = new Uint8Array(fileContent);

    // 1. Normalize Blob
    const blobResult = Core.FileNormalizer.toBlob(blobData, pubky);
    // 2. Normalize File Record
    const fileResult = Core.FileNormalizer.toFile(file, blobResult.meta.url, pubky);
    // 3. Upload to homeserver
    await Core.FileApplication.upload({ blobResult, fileResult });

    return fileResult.meta.url;
  }

  /**
   * Gets the CDN URL for a user's avatar.
   *
   * @param pubky - User's public key
   * @returns CDN URL string for the avatar
   */
  static getAvatarUrl(pubky: Core.Pubky): string {
    return Core.FileApplication.getAvatarUrl(pubky);
  }

  /**
   * Gets the CDN URL for an image file with a specific variant.
   *
   * @param params - Parameters for image URL
   * @param params.pubky - User's public key
   * @param params.fileId - File identifier
   * @param params.variant - Image variant (small, feed, main)
   * @returns CDN URL string
   */
  static getImageUrl({ fileId, variant }: Core.TGetImageUrlParams): string {
    return Core.FileApplication.getImageUrl({ fileId, variant });
  }

  /**
   * Gets files metadata
   *
   * @param params - Parameters for reading files
   * @param params.fileUris - Array of file URIs (pubky) to fetch
   * @returns Promise resolving to file metadata
   */
  static async getMetadata({ fileAttachments }: Core.TGetMetadataParams) {
    return await Core.FileApplication.getMetadata({ fileAttachments });
  }
}