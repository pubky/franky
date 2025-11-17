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
   *
   * @example
   * ```typescript
   * const file = new File([blob], 'image.png', { type: 'image/png' });
   * const fileUrl = await FileController.upload({ file, pubky: userPubky });
   * ```
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
   *
   * @example
   * ```typescript
   * const avatarUrl = FileController.getAvatarUrl(userPubky);
   * ```
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
   *
   * @example
   * ```typescript
   * const imageUrl = FileController.getImageUrl({
   *   pubky: userPubky,
   *   fileId: 'file123',
   *   variant: Core.FileVariant.FEED
   * });
   * ```
   */
  static getImageUrl({ fileId, variant }: Core.TGetImageUrlParams): string {
    return Core.FileApplication.getImageUrl({ fileId, variant });
  }

  // /**
  //  * Reads file metadata from nexus by file URIs.
  //  *
  //  * @param params - Parameters for reading files
  //  * @param params.fileUris - Array of file URIs (pubky) to fetch
  //  * @returns Promise resolving to file metadata
  //  *
  //  * @example
  //  * ```typescript
  //  * const files = await FileController.read({
  //  *   fileUris: ['pubky1', 'pubky2']
  //  * });
  //  * ```
  //  */
  // static async read({ fileUris }: Core.TReadFilesParams) {
  //   return await Core.FileApplication.read({ fileUris });
  // }
}
