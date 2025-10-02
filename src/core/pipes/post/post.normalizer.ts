import { PostResult } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostNormalizer {
  private constructor() {}

  static async to(post: Core.PostValidatorData, specsPubky: Core.Pubky): Promise<PostResult> {
    const builder = Core.PubkySpecsSingleton.get(specsPubky);

    const result = builder.createPost(
      post.content,
      post.kind,
      post.parentUri ?? null,
      null, // embed - will be added later when needed
      null, // attachments - will be added later when needed
    );

    Libs.Logger.debug('Post validated', { result });

    return result;
  }
}
