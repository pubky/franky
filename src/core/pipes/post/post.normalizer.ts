import { PostResult, PubkyAppPostEmbed } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostNormalizer {
  private constructor() {}

  static postKindToLowerCase(kind: string): string {
    // We will use that one until we fix the pubky-app-specs library
    return kind.toLowerCase();
  }

  static async to(post: Core.PostValidatorData, specsPubky: Core.Pubky): Promise<PostResult> {
    const builder = Core.PubkySpecsSingleton.get(specsPubky);

    // Create embed object if embed URI is provided
    let embedObject: PubkyAppPostEmbed | null = null;
    if (post.embed) {
      const embeddedPostId = Core.buildPostIdFromPubkyUri(post.embed);
      if (embeddedPostId) {
        const embeddedPost = await Core.PostDetailsModel.findById(embeddedPostId);
        if (embeddedPost) {
          embedObject = new PubkyAppPostEmbed(post.embed, embeddedPost.kind as unknown as Core.PubkyAppPostKind);
        }
      }
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
