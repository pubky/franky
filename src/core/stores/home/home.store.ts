import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { HomeStore, homeInitialState } from './home.types';
import { createHomeActions } from './home.actions';

// Store creation
export const useHomeStore = create<HomeStore>()(
  devtools(
    persist(
      (set) => ({
        ...homeInitialState,
        ...createHomeActions(set),
      }),
      {
        name: 'home-store',
        // Persist all home states
        partialize: (state) => ({
          layout: state.layout,
          sort: state.sort,
          reach: state.reach,
          content: state.content,
        }),
      },
    ),
    {
      name: 'home-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);

