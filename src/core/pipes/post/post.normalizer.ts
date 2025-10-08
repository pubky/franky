import { PostResult, PubkyAppPostEmbed } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostNormalizer {
  private constructor() {}

  static async to(post: Core.PostValidatorData, specsPubky: Core.Pubky): Promise<PostResult> {
    const builder = Core.PubkySpecsSingleton.get(specsPubky);

    // Create embed object if embed URI is provided
    let embedObject: PubkyAppPostEmbed | null = null;
    if (post.embed) {
      embedObject = new PubkyAppPostEmbed(post.embed, post.kind);
    }

    const result = builder.createPost(
      post.content,
      post.kind,
      post.parentUri ?? null,
      embedObject,
      null, // attachments - will be added later when needed
    );

    Libs.Logger.debug('Post validated', { result });

    return result;
  }
}
