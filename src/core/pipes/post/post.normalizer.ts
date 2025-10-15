import { PostResult, PubkyAppPostEmbed, PubkyAppPostKind } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostNormalizer {
  private constructor() {}

  static stringToPostKind(kind: string): PubkyAppPostKind {
    const normalized = kind.toLowerCase();
    switch (normalized) {
      case 'short':
        return PubkyAppPostKind.Short;
      case 'long':
        return PubkyAppPostKind.Long;
      case 'image':
        return PubkyAppPostKind.Image;
      case 'video':
        return PubkyAppPostKind.Video;
      case 'link':
        return PubkyAppPostKind.Link;
      case 'file':
        return PubkyAppPostKind.File;
      default:
        return PubkyAppPostKind.Short;
    }
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
          embedObject = new PubkyAppPostEmbed(post.embed, embeddedPost.kind);
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
