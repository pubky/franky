import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type BootstrapStore, bootstrapInitialState } from './bootstrap.types';
import { createBootstrapActions } from './bootstrap.actions';

// No persistence - this is ephemeral state that resets on page refresh
export const useBootstrapStore = create<BootstrapStore>()(
  devtools(
    (set) => ({
      ...bootstrapInitialState,
      ...createBootstrapActions(set),
    }),
    {
      name: 'bootstrap-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
