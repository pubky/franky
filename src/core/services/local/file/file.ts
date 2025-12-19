import * as Core from '@/core';

export class LocalFileService {
  private constructor() {} // Prevent instantiation

  static async createMany({ files }: Core.TPersistFilesParams) {
    await Core.FileDetailsModel.bulkSave(files);
  }

  static async read(compositeFileId: string): Promise<Core.NexusFileDetails | null> {
    return await Core.FileDetailsModel.findById(compositeFileId);
  }

  static async findByIds(compositeFileIds: string[]): Promise<Core.NexusFileDetails[]> {
    return await Core.FileDetailsModel.findByIds(compositeFileIds);
  }

  static async deleteById(compositeFileId: string) {
    await Core.FileDetailsModel.deleteById(compositeFileId);
  }

  /**
   * Creates a new file record in the local database.
   * Instead of wait nexus to index the file, we create the file record immediately hardcoding the urls.
   * NOTE: In the future, if we store the files in another server, the urls might be different,
   * and we might need to query nexus before persisting the file record.
   *
   * @param blobResult - Blob result
   * @param fileResult - File result
   */
  static async create({ blobResult, fileResult }: Core.TFileAttachmentResult) {
    const uri = fileResult.meta.url;
    const fileCompositeId = Core.buildCompositeIdFromPubkyUri({ uri, domain: Core.CompositeIdDomain.FILES });

    if (fileCompositeId) {
      const file: Core.NexusFileDetails = {
        id: fileCompositeId,
        name: fileResult.file.name,
        src: blobResult.meta.url,
        uri: fileResult.meta.url,
        content_type: fileResult.file.content_type,
        size: fileResult.file.size,
        created_at: Number(fileResult.file.created_at),
        indexed_at: Number(fileResult.file.created_at),
        metadata: {},
        owner_id: fileCompositeId.split(':')[0],
        urls: Core.buildUrls(fileCompositeId),
      };
      await Core.FileDetailsModel.create(file);
    }
  }
}
