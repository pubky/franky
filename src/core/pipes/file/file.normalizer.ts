import { BlobResult, FileResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class FileNormalizer {
  private constructor() {}

  static toBlob(blob: Uint8Array, pubky: Core.Pubky): BlobResult {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createBlob(blob);

    Libs.Logger.debug('Blob validated', { result });

    return result;
  }

  static toFile(file: File, url: string, pubky: Core.Pubky): FileResult {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createFile(file.name, url, file.type, file.size);

    Libs.Logger.debug('File validated', { result });

    return result;
  }
}
