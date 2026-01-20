import { PostResult, PubkyAppPostEmbed, PubkyAppPostKind } from 'pubky-app-specs';
import * as Core from '@/core';
import { Err, ValidationErrorCode, ErrorService, getErrorMessage, isAppError } from '@/libs';

export class PostNormalizer {
  private constructor() {}

  static postKindToLowerCase(kind: string): string {
    // We will use that one until we fix the pubky-app-specs library
    return kind.toLowerCase();
  }

  static async to(post: Core.PostValidatorData, specsPubky: Core.Pubky): Promise<PostResult> {
    try {
      const builder = Core.PubkySpecsSingleton.get(specsPubky);

      // Create embed object if embed URI is provided
      let embedObject: PubkyAppPostEmbed | null = null;
      if (post.embed) {
        const embeddedPostId = Core.buildCompositeIdFromPubkyUri({
          uri: post.embed,
          domain: Core.CompositeIdDomain.POSTS,
        });
        if (embeddedPostId) {
          const embeddedPost = await Core.PostDetailsModel.findById(embeddedPostId);
          if (embeddedPost) {
            embedObject = new PubkyAppPostEmbed(post.embed, embeddedPost.kind as unknown as PubkyAppPostKind);
          }
        }
      }

      let attachments: string[] | null = null;

      if (post.attachments) {
        attachments = post.attachments.map((attachment) => attachment.fileResult.meta.url);
      }

      return builder.createPost(post.content, post.kind, post.parentUri ?? null, embedObject, attachments);
    } catch (error) {
      if (isAppError(error)) {
        throw error;
      }
      throw Err.validation(ValidationErrorCode.INVALID_INPUT, getErrorMessage(error), {
        service: ErrorService.PubkyAppSpecs,
        operation: 'createPost',
        context: { post, specsPubky },
        cause: error,
      });
    }
  }
}
