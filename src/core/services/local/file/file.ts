import * as Core from '@/core';

export class LocalFileService {
  static async persistFiles({ files }: Core.TPersistFilesParams): Promise<void> {
    await Core.FileDetailsModel.bulkSave(files);
  }
}