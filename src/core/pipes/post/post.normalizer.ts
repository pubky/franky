import { PostResult, PubkyAppPostKind } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostNormalizer {
  private constructor() {}

  static async to(post: Core.PostValidatorData, pubky: Core.Pubky): Promise<PostResult> {
    const builder = Core.PubkySpecsSingleton.get(pubky);

    const kind = post.kind === 'short' ? PubkyAppPostKind.Short : PubkyAppPostKind.Long;
    const result = builder.createPost(post.content, kind);

    Libs.Logger.debug('Post validated', { result });

    return result;
  }
}
