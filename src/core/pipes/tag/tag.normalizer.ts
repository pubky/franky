import { TagResult, postUriBuilder, userUriBuilder } from 'pubky-app-specs';
import * as Core from '@/core';
import * as Libs from '@/libs';

export class TagNormalizer {
  private constructor() {}

  static from({ taggedKind, taggedId, label, taggerId }: Core.TTagEventParams): Core.TTagFromResponse {
    let uri: string;
    if (taggedKind === Core.TagKind.POST) {
      const { pubky, id: postId } = Core.parseCompositeId(taggedId);
      uri = postUriBuilder(pubky, postId);
    } else {
      uri = userUriBuilder(taggedId);
    }
    const { tag, meta } = Core.TagNormalizer.to(uri, label.trim(), taggerId);

    return {
      taggerId,
      taggedId,
      label: tag.label.toLowerCase(),
      taggedKind,
      tagUrl: meta.url,
      tagJson: tag.toJson(),
    };
  }

  static to(uri: string, label: string, pubky: Core.Pubky): TagResult {
    const builder = Core.PubkySpecsSingleton.get(pubky);
    const result = builder.createTag(uri, label);
    Libs.Logger.debug('Tag validated', { result });
    return result;
  }
}
