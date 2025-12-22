import { SearchStore, SearchActions, SearchActionTypes, RecentUserSearch, RecentTagSearch } from './search.types';
import { ZustandSet } from '../stores.types';
import { MAX_RECENT_SEARCHES, MAX_ACTIVE_SEARCH_TAGS } from './search.constants';
import * as Core from '@/core';

/**
 * Actions/Mutators - State modification functions
 */
export const createSearchActions = (set: ZustandSet<SearchStore>): SearchActions => ({
  /**
   * Add a user to recent searches
   * Moves existing user to top if already present
   * Removes oldest if at max capacity
   */
  addUser: (userId: Core.Pubky) => {
    set(
      (state) => {
        const now = Date.now();
        const existingIndex = state.recentUsers.findIndex((user) => user.id === userId);

        let newUsers: RecentUserSearch[];

        if (existingIndex >= 0) {
          // Move existing user to top
          newUsers = [{ id: userId, searchedAt: now }, ...state.recentUsers.filter((user) => user.id !== userId)];
        } else {
          // Add new user, remove oldest if at limit
          const usersToKeep = state.recentUsers.slice(0, MAX_RECENT_SEARCHES - 1);
          newUsers = [{ id: userId, searchedAt: now }, ...usersToKeep];
        }

        return { recentUsers: newUsers };
      },
      false,
      SearchActionTypes.ADD_USER,
    );
  },

  /**
   * Add a tag to recent searches
   * Moves existing tag to top if already present
   * Removes oldest if at max capacity
   * Note: Tag should be normalized (lowercase, trimmed) before calling
   */
  addTag: (tag: string) => {
    set(
      (state) => {
        const now = Date.now();
        const existingIndex = state.recentTags.findIndex((t) => t.tag === tag);

        let newTags: RecentTagSearch[];

        if (existingIndex >= 0) {
          // Move existing tag to top
          newTags = [{ tag, searchedAt: now }, ...state.recentTags.filter((t) => t.tag !== tag)];
        } else {
          // Add new tag, remove oldest if at limit
          const tagsToKeep = state.recentTags.slice(0, MAX_RECENT_SEARCHES - 1);
          newTags = [{ tag, searchedAt: now }, ...tagsToKeep];
        }

        return { recentTags: newTags };
      },
      false,
      SearchActionTypes.ADD_TAG,
    );
  },

  /**
   * Clear only recent searches (users and tags), keep active tags
   */
  clearRecentSearches: () => {
    set(
      (_state) => ({
        recentUsers: [],
        recentTags: [],
      }),
      false,
      SearchActionTypes.CLEAR_RECENT_SEARCHES,
    );
  },

  /**
   * Set active tags (used for URL → store sync)
   * Replaces all active tags with the provided array
   * Note: Tags should be normalized (lowercase, trimmed) before calling
   */
  setActiveTags: (tags: string[]) => {
    set(
      () => ({
        activeTags: tags.slice(0, MAX_ACTIVE_SEARCH_TAGS),
      }),
      false,
      SearchActionTypes.SET_ACTIVE_TAGS,
    );
  },

  /**
   * Add a tag to active tags (optimistic update)
   * Moves existing tag to end if already present
   * Removes oldest tag if at max capacity
   * Note: Tag should be normalized (lowercase, trimmed) before calling
   */
  addActiveTag: (tag: string) => {
    set(
      (state) => {
        if (tag.length === 0) return state;

        // Check if tag already exists
        const existingIndex = state.activeTags.indexOf(tag);

        if (existingIndex >= 0) {
          // Move existing tag to end
          const tagsWithoutExisting = state.activeTags.filter((t) => t !== tag);
          return {
            activeTags: [...tagsWithoutExisting, tag],
          };
        }

        // If at max, remove oldest (first) tag
        if (state.activeTags.length >= MAX_ACTIVE_SEARCH_TAGS) {
          return {
            activeTags: [...state.activeTags.slice(1), tag],
          };
        }

        return {
          activeTags: [...state.activeTags, tag],
        };
      },
      false,
      SearchActionTypes.ADD_ACTIVE_TAG,
    );
  },

  /**
   * Remove a tag from active tags (optimistic update)
   * Note: Tag should be normalized (lowercase, trimmed) before calling
   */
  removeActiveTag: (tag: string) => {
    set(
      (state) => ({
        activeTags: state.activeTags.filter((t) => t !== tag),
      }),
      false,
      SearchActionTypes.REMOVE_ACTIVE_TAG,
    );
  },
});
