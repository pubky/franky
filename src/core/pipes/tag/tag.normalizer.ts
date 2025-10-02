import { TagResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class TagNormalizer {
  private constructor() {}

  static async to(uri: string, label: string, pubky: Core.Pubky): Promise<TagResult> {
    const builder = Core.PubkySpecsSingleton.get(pubky);

    const result = builder.createTag(uri, label);

    Libs.Logger.debug('Tag validated', { result });

    return result;
  }
}
