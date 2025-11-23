import { BlobResult, FileResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class FileNormalizer {
  private constructor() {}

  static async toFileAttachment({ file, pubky }: Core.TUploadFileParams): Promise<Core.TFileAttachmentResult> {
    const blobResult = await this.toBlob({ file, pubky });
    const fileResult = this.toFile({ file, url: blobResult.meta.url, pubky });
    return { blobResult, fileResult };
  }

  private static async toBlob({ file, pubky }: Core.TUploadFileParams): Promise<BlobResult> {
    const fileContent = await file.arrayBuffer();
    const blobData = new Uint8Array(fileContent);

    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createBlob(blobData);

    Libs.Logger.debug('Blob validated', { result });

    return result;
  }

  private static toFile({ file, url, pubky }: Core.TToFileParams): FileResult {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createFile(file.name, url, file.type, file.size);

    Libs.Logger.debug('File validated', { result });

    return result;
  }
}
