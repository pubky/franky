import * as Core from '@/core';

export function createPostStreamParams(
  streamId: Core.PostStreamId,
  streamTail: number,
  limit: number,
  viewerId?: Core.Pubky,
): Core.TPostStreamFetchParams {
  // TODO: TBD how to add tags to the streamsId in indexdb.
  // From now, idea is to add with ',' character. Pubky-app-specs is going to restrict a tag with that character, ongoing implementation.
  const [sorting, invokeEndpoint, content] = breakDownStreamId(streamId);

  const params: Core.TStreamBase = {};
  params.viewer_id = viewerId;
  params.sorting = parseSorting(sorting);
  if (content && invokeEndpoint !== Core.StreamSource.REPLIES) {
    params.kind = parseContent(content);
  }
  const extraParams = handleNotCommonStreamParams(sorting, content);
  params.limit = limit;
  setStreamPagination(params, streamTail);
  return { params, invokeEndpoint, extraParams };
}

function handleNotCommonStreamParams(authorId: string, postId: string | undefined) {
  const extraParams: Record<string, string> = {};
  extraParams.author_id = authorId;

  if (postId) {
    extraParams.post_id = postId;
  }
  return extraParams;
}

function setStreamPagination(params: Core.TStreamBase, streamTail: number) {
  if (params.sorting === Core.StreamSorting.ENGAGEMENT) {
    params.skip = streamTail; // post amount of the stream, page number * limit
  } else {
    // Only set start if streamTail is not 0 (0 means initial load - fetch most recent)
    if (streamTail > 0) {
      params.start = streamTail; // timestamp of the last post
    }
    // If streamTail is 0, don't set start - this will fetch the most recent posts
  }
}

// TODO: Still edge cases to cover
// - Replies stream do not handle now the sorting and kind
// - Author replies and author streams do not handle now the kind

/**
 * Breaks down a stream ID into its components (sorting, endpoint, kind).
 * NOTE: There are some special streams that does not follow timline pattern as post_replies, author_replies and author.
 *
 * @param streamId - The stream ID to break down
 * @returns A tuple of [sorting, invokeEndpoint, kind]
 */
function breakDownStreamId(streamId: Core.PostStreamId): [string, string, string | undefined] {
  const [sorting, invokeEndpoint, kind] = streamId.split(':');
  if (kind) {
    if (sorting === Core.StreamSource.REPLIES) {
      // [pubky, post_replies, postId]
      return [invokeEndpoint, sorting, kind];
    }
    // Applies to timeline pattern
    return [sorting, invokeEndpoint, kind];
  }
  // That case covers Core.StreamSource.AUTHOR_REPLIES and Core.StreamSource.AUTHOR
  // i.e. [pubky, author_replies | author, undefined]
  return [invokeEndpoint, sorting, undefined];
}

function parseSorting(sorting: string): Core.StreamSorting | undefined {
  const sortingMap: Record<string, Core.StreamSorting> = {
    timeline: Core.StreamSorting.TIMELINE,
    total_engagement: Core.StreamSorting.ENGAGEMENT,
  };
  return sortingMap[sorting];
}

function parseContent(content: string): Core.StreamKind | undefined {
  // When content is 'all', return undefined (no kind filter)
  if (content === 'all') {
    return undefined;
  }

  const contentMap: Record<string, Core.StreamKind> = {
    short: Core.StreamKind.SHORT,
    long: Core.StreamKind.LONG,
    image: Core.StreamKind.IMAGE,
    video: Core.StreamKind.VIDEO,
    link: Core.StreamKind.LINK,
    file: Core.StreamKind.FILE,
  };
  return contentMap[content];
}

// function isReplyStream(source: string): boolean {
//   return source === Core.StreamSource.REPLIES || source === Core.StreamSource.AUTHOR_REPLIES;
// }
