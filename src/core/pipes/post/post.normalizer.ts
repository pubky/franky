import { PostResult, PubkyAppPostEmbed, PubkyAppPostKind, PubkyAppPost } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class PostNormalizer {
  private constructor() {}

  static postKindToLowerCase(kind: string): string {
    // We will use that one until we fix the pubky-app-specs library
    return kind.toLowerCase();
  }

  /**
   * Maps stored kind string to PubkyAppPostKind enum.
   * DB stores "short"/"long" strings, but PubkyAppPost expects numeric enum values.
   */
  static mapKindToEnum(kind: string): PubkyAppPostKind {
    const normalized = kind.toLowerCase();
    if (normalized === 'long' || normalized === '1') {
      return PubkyAppPostKind.Long;
    }
    return PubkyAppPostKind.Short;
  }

  static async to(post: Core.PostValidatorData, specsPubky: Core.Pubky): Promise<PostResult> {
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

    const result = builder.createPost(post.content, post.kind, post.parentUri ?? null, embedObject, attachments);

    Libs.Logger.debug('Post validated', { result });

    return result;
  }

  static async toEdit({ compositePostId, content, currentUserPubky }: Core.TEditPostParams): Promise<PostResult> {
    const { pubky: authorId, id: postId } = Core.parseCompositeId(compositePostId);

    if (authorId !== currentUserPubky) {
      // TODO: With the new error handling, would be fixed the error type
      throw Libs.createSanitizationError(
        Libs.SanitizationErrorType.POST_NOT_FOUND,
        'Current user is not the author of this post',
        403,
        {
          postId,
          currentUserPubky,
        },
      );
    }

    const builder = Core.PubkySpecsSingleton.get(authorId);

    const postDetails = await Core.PostDetailsModel.findById(compositePostId);
    if (!postDetails) {
      throw Libs.createSanitizationError(Libs.SanitizationErrorType.POST_NOT_FOUND, 'Post not found', 404, {
        postId: compositePostId,
      });
    }

    const postRelationships = await Core.PostRelationshipsModel.findById(compositePostId);

    // Reconstruct the original PubkyAppPost from stored data
    let embedObject: PubkyAppPostEmbed | undefined;
    if (postRelationships?.reposted) {
      // Get the embedded post's kind if available
      const embeddedPostId = Core.buildCompositeIdFromPubkyUri({
        uri: postRelationships.reposted,
        domain: Core.CompositeIdDomain.POSTS,
      });
      if (embeddedPostId) {
        const embeddedPost = await Core.PostDetailsModel.findById(embeddedPostId);
        if (embeddedPost) {
          embedObject = new PubkyAppPostEmbed(postRelationships.reposted, this.mapKindToEnum(embeddedPost.kind));
        }
      }
    }

    const originalPost = new PubkyAppPost(
      postDetails.content,
      this.mapKindToEnum(postDetails.kind),
      postRelationships?.replied ?? null,
      embedObject ?? null,
      postDetails.attachments,
    );

    const result = builder.editPost(originalPost, postId, content);

    Libs.Logger.debug('Post validated', { result });

    return result;
  }
}
