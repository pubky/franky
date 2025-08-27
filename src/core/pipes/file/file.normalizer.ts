import {
  BlobResult,
  FileResult,
} from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class FileNormalizer {

  private constructor() {}

  static async toBlob(blob: Uint8Array, pubky: string): Promise<BlobResult> {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createBlob(blob);

    Libs.Logger.debug('Blob validated', { result });

    return result;
  }

  static async toFile(file: File, url: string, pubky: string): Promise<FileResult> {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createFile(file.name, url, file.type, file.size);

    Libs.Logger.debug('File validated', { result });

    return result;
  }
}
