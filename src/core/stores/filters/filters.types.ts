// Filter constants
export const LAYOUT = {
  COLUMNS: 'columns',
  WIDE: 'wide',
  VISUAL: 'visual',
} as const;

export const SORT = {
  RECENT: 'recent',
  POPULARITY: 'popularity',
} as const;

export const REACH = {
  ALL: 'all',
  FOLLOWING: 'following',
  FRIENDS: 'friends',
  ME: 'me',
} as const;

export const CONTENT = {
  ALL: 'all',
  POSTS: 'posts',
  ARTICLES: 'articles',
  IMAGES: 'images',
  VIDEOS: 'videos',
  LINKS: 'links',
  FILES: 'files',
} as const;

// Filter types
export type LayoutType = (typeof LAYOUT)[keyof typeof LAYOUT];
export type SortType = (typeof SORT)[keyof typeof SORT];
export type ReachType = (typeof REACH)[keyof typeof REACH];
export type ContentType = (typeof CONTENT)[keyof typeof CONTENT];

export interface FiltersState {
  layout: LayoutType;
  sort: SortType;
  reach: ReachType;
  content: ContentType;
}

export interface FiltersActions {
  setLayout: (layout: LayoutType) => void;
  setSort: (sort: SortType) => void;
  setReach: (reach: ReachType) => void;
  setContent: (content: ContentType) => void;
  reset: () => void;
}

export type FiltersStore = FiltersState & FiltersActions;

// Initial state
export const filtersInitialState: FiltersState = {
  layout: LAYOUT.COLUMNS,
  sort: SORT.RECENT,
  reach: REACH.ALL,
  content: CONTENT.ALL,
};

// Action types for DevTools
export enum FiltersActionTypes {
  SET_LAYOUT = 'filters/setLayout',
  SET_SORT = 'filters/setSort',
  SET_REACH = 'filters/setReach',
  SET_CONTENT = 'filters/setContent',
  RESET = 'filters/reset',
}
