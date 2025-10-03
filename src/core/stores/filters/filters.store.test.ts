import { describe, it, expect, beforeEach } from 'vitest';
import { useFiltersStore } from './filters.store';
import { LAYOUT, SORT, REACH, CONTENT, filtersInitialState } from './filters.types';

describe('FiltersStore', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useFiltersStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should initialize with default filter values', () => {
      const state = useFiltersStore.getState();

      expect(state.layout).toBe(LAYOUT.COLUMNS);
      expect(state.sort).toBe(SORT.RECENT);
      expect(state.reach).toBe(REACH.ALL);
      expect(state.content).toBe(CONTENT.ALL);
    });

    it('should match filtersInitialState', () => {
      const state = useFiltersStore.getState();

      expect(state.layout).toBe(filtersInitialState.layout);
      expect(state.sort).toBe(filtersInitialState.sort);
      expect(state.reach).toBe(filtersInitialState.reach);
      expect(state.content).toBe(filtersInitialState.content);
    });
  });

  describe('Layout Management', () => {
    it('should set layout to columns', () => {
      const store = useFiltersStore.getState();

      store.setLayout(LAYOUT.COLUMNS);
      expect(useFiltersStore.getState().layout).toBe(LAYOUT.COLUMNS);
    });

    it('should set layout to wide', () => {
      const store = useFiltersStore.getState();

      store.setLayout(LAYOUT.WIDE);
      expect(useFiltersStore.getState().layout).toBe(LAYOUT.WIDE);
    });

    it('should set layout to visual', () => {
      const store = useFiltersStore.getState();

      store.setLayout(LAYOUT.VISUAL);
      expect(useFiltersStore.getState().layout).toBe(LAYOUT.VISUAL);
    });

    it('should persist layout changes', () => {
      const store = useFiltersStore.getState();

      store.setLayout(LAYOUT.WIDE);
      expect(useFiltersStore.getState().layout).toBe(LAYOUT.WIDE);

      store.setLayout(LAYOUT.VISUAL);
      expect(useFiltersStore.getState().layout).toBe(LAYOUT.VISUAL);
    });
  });

  describe('Sort Management', () => {
    it('should set sort to recent', () => {
      const store = useFiltersStore.getState();

      store.setSort(SORT.RECENT);
      expect(useFiltersStore.getState().sort).toBe(SORT.RECENT);
    });

    it('should set sort to popularity', () => {
      const store = useFiltersStore.getState();

      store.setSort(SORT.POPULARITY);
      expect(useFiltersStore.getState().sort).toBe(SORT.POPULARITY);
    });

    it('should toggle between sort options', () => {
      const store = useFiltersStore.getState();

      store.setSort(SORT.POPULARITY);
      expect(useFiltersStore.getState().sort).toBe(SORT.POPULARITY);

      store.setSort(SORT.RECENT);
      expect(useFiltersStore.getState().sort).toBe(SORT.RECENT);
    });
  });

  describe('Reach Management', () => {
    it('should set reach to all', () => {
      const store = useFiltersStore.getState();

      store.setReach(REACH.ALL);
      expect(useFiltersStore.getState().reach).toBe(REACH.ALL);
    });

    it('should set reach to following', () => {
      const store = useFiltersStore.getState();

      store.setReach(REACH.FOLLOWING);
      expect(useFiltersStore.getState().reach).toBe(REACH.FOLLOWING);
    });

    it('should set reach to friends', () => {
      const store = useFiltersStore.getState();

      store.setReach(REACH.FRIENDS);
      expect(useFiltersStore.getState().reach).toBe(REACH.FRIENDS);
    });

    it('should set reach to me', () => {
      const store = useFiltersStore.getState();

      store.setReach(REACH.ME);
      expect(useFiltersStore.getState().reach).toBe(REACH.ME);
    });

    it('should change reach multiple times', () => {
      const store = useFiltersStore.getState();

      store.setReach(REACH.FOLLOWING);
      expect(useFiltersStore.getState().reach).toBe(REACH.FOLLOWING);

      store.setReach(REACH.FRIENDS);
      expect(useFiltersStore.getState().reach).toBe(REACH.FRIENDS);

      store.setReach(REACH.ALL);
      expect(useFiltersStore.getState().reach).toBe(REACH.ALL);
    });
  });

  describe('Content Management', () => {
    it('should set content to all', () => {
      const store = useFiltersStore.getState();

      store.setContent(CONTENT.ALL);
      expect(useFiltersStore.getState().content).toBe(CONTENT.ALL);
    });

    it('should set content to posts', () => {
      const store = useFiltersStore.getState();

      store.setContent(CONTENT.POSTS);
      expect(useFiltersStore.getState().content).toBe(CONTENT.POSTS);
    });

    it('should set content to articles', () => {
      const store = useFiltersStore.getState();

      store.setContent(CONTENT.ARTICLES);
      expect(useFiltersStore.getState().content).toBe(CONTENT.ARTICLES);
    });

    it('should set content to images', () => {
      const store = useFiltersStore.getState();

      store.setContent(CONTENT.IMAGES);
      expect(useFiltersStore.getState().content).toBe(CONTENT.IMAGES);
    });

    it('should set content to videos', () => {
      const store = useFiltersStore.getState();

      store.setContent(CONTENT.VIDEOS);
      expect(useFiltersStore.getState().content).toBe(CONTENT.VIDEOS);
    });

    it('should set content to links', () => {
      const store = useFiltersStore.getState();

      store.setContent(CONTENT.LINKS);
      expect(useFiltersStore.getState().content).toBe(CONTENT.LINKS);
    });

    it('should set content to files', () => {
      const store = useFiltersStore.getState();

      store.setContent(CONTENT.FILES);
      expect(useFiltersStore.getState().content).toBe(CONTENT.FILES);
    });

    it('should change content filter multiple times', () => {
      const store = useFiltersStore.getState();

      store.setContent(CONTENT.POSTS);
      expect(useFiltersStore.getState().content).toBe(CONTENT.POSTS);

      store.setContent(CONTENT.IMAGES);
      expect(useFiltersStore.getState().content).toBe(CONTENT.IMAGES);

      store.setContent(CONTENT.ALL);
      expect(useFiltersStore.getState().content).toBe(CONTENT.ALL);
    });
  });

  describe('Multiple Filter Changes', () => {
    it('should handle multiple filter changes independently', () => {
      const store = useFiltersStore.getState();

      store.setLayout(LAYOUT.WIDE);
      store.setSort(SORT.POPULARITY);
      store.setReach(REACH.FOLLOWING);
      store.setContent(CONTENT.IMAGES);

      const state = useFiltersStore.getState();
      expect(state.layout).toBe(LAYOUT.WIDE);
      expect(state.sort).toBe(SORT.POPULARITY);
      expect(state.reach).toBe(REACH.FOLLOWING);
      expect(state.content).toBe(CONTENT.IMAGES);
    });

    it('should maintain other filters when one is changed', () => {
      const store = useFiltersStore.getState();

      // Set initial filters
      store.setLayout(LAYOUT.WIDE);
      store.setSort(SORT.POPULARITY);
      store.setReach(REACH.FOLLOWING);
      store.setContent(CONTENT.IMAGES);

      // Change only one filter
      store.setSort(SORT.RECENT);

      // Other filters should remain unchanged
      const state = useFiltersStore.getState();
      expect(state.layout).toBe(LAYOUT.WIDE);
      expect(state.sort).toBe(SORT.RECENT);
      expect(state.reach).toBe(REACH.FOLLOWING);
      expect(state.content).toBe(CONTENT.IMAGES);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset all filters to initial state', () => {
      const store = useFiltersStore.getState();

      // Set all filters to non-default values
      store.setLayout(LAYOUT.WIDE);
      store.setSort(SORT.POPULARITY);
      store.setReach(REACH.FOLLOWING);
      store.setContent(CONTENT.IMAGES);

      // Verify state is set
      expect(useFiltersStore.getState().layout).toBe(LAYOUT.WIDE);
      expect(useFiltersStore.getState().sort).toBe(SORT.POPULARITY);
      expect(useFiltersStore.getState().reach).toBe(REACH.FOLLOWING);
      expect(useFiltersStore.getState().content).toBe(CONTENT.IMAGES);

      // Reset store
      store.reset();

      // Verify state is reset to initial values
      const state = useFiltersStore.getState();
      expect(state.layout).toBe(LAYOUT.COLUMNS);
      expect(state.sort).toBe(SORT.RECENT);
      expect(state.reach).toBe(REACH.ALL);
      expect(state.content).toBe(CONTENT.ALL);
    });

    it('should reset partial changes', () => {
      const store = useFiltersStore.getState();

      // Change only some filters
      store.setLayout(LAYOUT.VISUAL);
      store.setReach(REACH.FRIENDS);

      // Reset
      store.reset();

      // All should be back to initial state
      const state = useFiltersStore.getState();
      expect(state.layout).toBe(LAYOUT.COLUMNS);
      expect(state.sort).toBe(SORT.RECENT);
      expect(state.reach).toBe(REACH.ALL);
      expect(state.content).toBe(CONTENT.ALL);
    });

    it('should be idempotent - multiple resets should have same result', () => {
      const store = useFiltersStore.getState();

      // Set some state
      store.setLayout(LAYOUT.WIDE);
      store.setSort(SORT.POPULARITY);

      // Reset multiple times
      store.reset();
      store.reset();
      store.reset();

      // Should still be at initial state
      const state = useFiltersStore.getState();
      expect(state.layout).toBe(LAYOUT.COLUMNS);
      expect(state.sort).toBe(SORT.RECENT);
      expect(state.reach).toBe(REACH.ALL);
      expect(state.content).toBe(CONTENT.ALL);
    });
  });

  describe('State Isolation', () => {
    it('should not affect other state properties when updating one', () => {
      const store = useFiltersStore.getState();

      // Get initial state
      const initialState = useFiltersStore.getState();

      // Change layout
      store.setLayout(LAYOUT.WIDE);

      // Other properties should remain the same
      expect(useFiltersStore.getState().sort).toBe(initialState.sort);
      expect(useFiltersStore.getState().reach).toBe(initialState.reach);
      expect(useFiltersStore.getState().content).toBe(initialState.content);
    });
  });

  describe('Type Safety', () => {
    it('should accept valid layout values', () => {
      const store = useFiltersStore.getState();

      // These should all work without type errors
      store.setLayout(LAYOUT.COLUMNS);
      store.setLayout(LAYOUT.WIDE);
      store.setLayout(LAYOUT.VISUAL);

      expect(useFiltersStore.getState().layout).toBe(LAYOUT.VISUAL);
    });

    it('should accept valid sort values', () => {
      const store = useFiltersStore.getState();

      store.setSort(SORT.RECENT);
      store.setSort(SORT.POPULARITY);

      expect(useFiltersStore.getState().sort).toBe(SORT.POPULARITY);
    });

    it('should accept valid reach values', () => {
      const store = useFiltersStore.getState();

      store.setReach(REACH.ALL);
      store.setReach(REACH.FOLLOWING);
      store.setReach(REACH.FRIENDS);
      store.setReach(REACH.ME);

      expect(useFiltersStore.getState().reach).toBe(REACH.ME);
    });

    it('should accept valid content values', () => {
      const store = useFiltersStore.getState();

      store.setContent(CONTENT.ALL);
      store.setContent(CONTENT.POSTS);
      store.setContent(CONTENT.ARTICLES);
      store.setContent(CONTENT.IMAGES);
      store.setContent(CONTENT.VIDEOS);
      store.setContent(CONTENT.LINKS);
      store.setContent(CONTENT.FILES);

      expect(useFiltersStore.getState().content).toBe(CONTENT.FILES);
    });
  });
});
