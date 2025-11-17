import * as Core from '@/core';

export class LocalFileService {
  private constructor() {} // Prevent instantiation

  static async persistFiles({ files }: Core.TPersistFilesParams): Promise<void> {
    await Core.FileDetailsModel.bulkSave(files);
  }

  static async findByIds(compositeFileIds: string[]): Promise<Core.NexusFileDetails[]> {
    return await Core.FileDetailsModel.findByIds(compositeFileIds);
  }
}