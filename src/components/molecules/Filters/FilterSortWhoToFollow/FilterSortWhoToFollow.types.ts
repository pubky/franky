import { WHO_TO_FOLLOW_SORT } from './FilterSortWhoToFollow.constants';

export type WhoToFollowSortType = (typeof WHO_TO_FOLLOW_SORT)[keyof typeof WHO_TO_FOLLOW_SORT];
