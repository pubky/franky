import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { FiltersStore, filtersInitialState } from './filters.types';
import { createFiltersActions } from './filters.actions';
import { withStoreBenchmarking } from '@/core/stores/storeBenchmarking';

// Store creation
export const useFiltersStore = create<FiltersStore>()(
  withStoreBenchmarking<FiltersStore>('filters-store')(
    devtools(
      persist(
        (set) => ({
          ...filtersInitialState,
          ...createFiltersActions(set),
        }),
        {
          name: 'filters-store',
          // Persist all filter states
          partialize: (state) => ({
            layout: state.layout,
            sort: state.sort,
            reach: state.reach,
            content: state.content,
          }),
        },
      ),
      {
        name: 'filters-store',
        enabled: process.env.NODE_ENV === 'development',
      },
    ),
  ),
);
