import { BlobResult, FileResult } from 'pubky-app-specs';
import * as Core from '@/core';
import { Err, ValidationErrorCode, ErrorService, getErrorMessage, isAppError } from '@/libs';

export class FileNormalizer {
  private constructor() {}

  static async toFileAttachment({ file, pubky }: Core.TUploadFileParams): Promise<Core.TFileAttachmentResult> {
    try {
      const blobResult = await this.toBlob({ file, pubky });
      const fileResult = this.toFile({ file, url: blobResult.meta.url, pubky });
      return { blobResult, fileResult };
    } catch (error) {
      // Always wrap as toFileAttachment operation at this boundary
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'toFileAttachment',
        context: { file, pubky },
        cause: error,
      });
    }
  }

  private static async toBlob({ file, pubky }: Core.TUploadFileParams): Promise<BlobResult> {
    try {
      const fileContent = await file.arrayBuffer();
      const blobData = new Uint8Array(fileContent);

      const builder = Core.PubkySpecsSingleton.get(pubky);
      return builder.createBlob(blobData);
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createBlob',
        context: { file, pubky },
        cause: error,
      });
    }
  }

  private static toFile({ file, url, pubky }: Core.TToFileParams): FileResult {
    try {
      const builder = Core.PubkySpecsSingleton.get(pubky);
      return builder.createFile(file.name, url, file.type, file.size);
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createFile',
        context: { file, url, pubky },
        cause: error,
      });
    }
  }
}
