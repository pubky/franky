// SORTING: timeline, total_engagement
// SOURCE: all, following, friends, bookmarks, post_replies, author, author_replies
// KIND: short, long, image, video, link, file
//
// sorting:source:kind
export enum PostStreamTypes {
  // Bootstrap default list
  TIMELINE_ALL = 'timeline:all:all',
  // Other lists, persisted after user navigation
  TIMELINE_FOLLOWING = 'timeline:following:all',
  TIMELINE_FRIENDS = 'timeline:friends:all',
  TIMELINE_PICTURES = 'timeline:all:image',
  // TODO: Not sure if we are going to store engagement related streams
  ENGAGEMENT_ALL = 'total_engagement:all:all',
  ENGAGEMENT_FOLLOWING = 'total_engagement:following:all',
  ENGAGEMENT_FRIENDS = 'total_engagement:friends:all',
}
