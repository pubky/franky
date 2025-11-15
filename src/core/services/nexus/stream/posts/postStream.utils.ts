import * as Core from '@/core';

export function createPostStreamParams(
  streamId: Core.PostStreamTypes,
  streamTail: number,
  limit: number,
  viewerId?: Core.Pubky,
): Core.TPostStreamFetchParams {
  // TODO: TBD how to add tags to the streamsId in indexdb.
  // From now, idea is to add with ',' character. Pubky-app-specs is going to restrict a tag with that character
  const [sorting, invokeEndpoint, content] = streamId.split(':');
  const params: Core.TStreamBase = {};
  params.viewer_id = viewerId;
  params.sorting = parseSorting(sorting);
  params.kind = parseContent(content);
  //   if (!isReplyStream(invokeEndpoint)) {
  //     params.order = Core.StreamOrder.DESCENDING;
  //   }
  params.limit = limit;
  setStreamPagination(params, streamTail);
  return { params, invokeEndpoint };
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
