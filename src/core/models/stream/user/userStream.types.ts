// TIMEFRAME: today, this_month, all_time
// SOURCE: followers, following, friends, muted, most_followed, influencers, recommended, post_replies
// REACH (Supported in 'influencers' source): followers, following, friends, wot (u8)
// timeframe:source:reach
export enum UserStreamTypes {
  TODAY_FOLLOWERS_ALL = 'today:followers:all',
  TODAY_FOLLOWING_ALL = 'today:following:all',
  TODAY_FRIENDS_ALL = 'today:friends:all',
}
