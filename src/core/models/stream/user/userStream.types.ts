import type { Pubky, UserStreamSource } from '@/core';

// User Stream ID Pattern: source:timeframe:reach
// - SOURCE: followers, following, friends, muted, most_followed, influencers, recommended, post_replies
// - TIMEFRAME: today, this_month, all_time, all
// - REACH (Supported in 'influencers' source): followers, following, friends, wot (u8), all
//
// Note: Different from PostStreamTypes pattern (sorting:source:kind) to optimize for user-centric queries
export enum UserStreamTypes {
  // Bootstrap default lists:
  // Active users in the UI. We get randomly, preview=true param active in nexus
  TODAY_INFLUENCERS_ALL = 'influencers:today:all',
  RECOMMENDED = 'recommended:all:all',
  // TODO: Add all possible cases
}

// Composite ID format: userId:reach (e.g., 'user123:followers')
// Template literal type enforces the colon separator
export type UserStreamCompositeId = `${Pubky}:${UserStreamSource}`;

export type UserStreamId = UserStreamTypes | UserStreamCompositeId;
