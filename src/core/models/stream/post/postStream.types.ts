// Post Stream ID Pattern: sorting:source:kind
// - SORTING: timeline, total_engagement
// - SOURCE: all, following, friends, bookmarks, post_replies, author, author_replies
// - KIND: short, long, image, video, link, file
export enum PostStreamTypes {
  // Bootstrap default list
  TIMELINE_ALL = 'timeline:all:all',
  // Other lists, persisted after user navigation
  TIMELINE_FOLLOWING = 'timeline:following:all',
  TIMELINE_FRIENDS = 'timeline:friends:all',
  TIMELINE_PICTURES = 'timeline:all:image',
}
