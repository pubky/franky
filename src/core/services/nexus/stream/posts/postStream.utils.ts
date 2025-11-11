import * as Core from '@/core';

export function createNexusParams(streamId: Core.PostStreamTypes, streamTail: number, limit: number, viewerId?: Core.Pubky): any {
  // TODO: TBD how to add tags to the streamsId in indexdb. 
  // From now, idea is to add with ',' character. Pubky-app-specs is going to restrict a tag with that character
  const [sorting, invokeEndpoint, content] = streamId.split(':');
  let params: Core.TStreamBase = {}
  params.viewer_id = viewerId;
  params.sorting = parseSorting(sorting);
  params.kind = parseContent(content);
  //TODO: When we will render replies, that one cannot be a default
  params.order = Core.StreamOrder.DESCENDING;
  params.limit = limit;
  setStreamPagination(params, streamTail);
  return { params, invokeEndpoint };
}

function setStreamPagination(params: Core.TStreamBase, streamTail: number) {
    if (params.sorting === Core.StreamSorting.ENGAGEMENT) {
        params.skip = streamTail; // post amount of the stream, page number * limit
    } else {
        params.start = streamTail; // timestamp of the last post
    }
}

function parseSorting(sorting: string): Core.StreamSorting | undefined {
    const sortingMap: Record<string, Core.StreamSorting> = {
        'timeline': Core.StreamSorting.TIMELINE,
        'total_engagement': Core.StreamSorting.ENGAGEMENT,
    };
    return sortingMap[sorting];
}

function parseContent(content: string): Core.StreamKind | undefined {
    const contentMap: Record<string, Core.StreamKind> = {
        'short': Core.StreamKind.SHORT,
        'long': Core.StreamKind.LONG,
        'images': Core.StreamKind.IMAGE,
        'videos': Core.StreamKind.VIDEO,
        'links': Core.StreamKind.LINK,
        'files': Core.StreamKind.FILE,
    };
    return contentMap[content];
}
