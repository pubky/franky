import { FiltersStore, FiltersActions, filtersInitialState, FiltersActionTypes } from './filters.types';
import { ZustandSet } from '../stores.types';

// Actions/Mutators - State modification functions
export const createFiltersActions = (set: ZustandSet<FiltersStore>): FiltersActions => ({
  setLayout: (layout) => {
    set({ layout }, false, FiltersActionTypes.SET_LAYOUT);
  },

  setSort: (sort) => {
    set({ sort }, false, FiltersActionTypes.SET_SORT);
  },

  setReach: (reach) => {
    set({ reach }, false, FiltersActionTypes.SET_REACH);
  },

  setContent: (content) => {
    set({ content }, false, FiltersActionTypes.SET_CONTENT);
  },

  reset: () => {
    set(filtersInitialState, false, FiltersActionTypes.RESET);
  },
});
