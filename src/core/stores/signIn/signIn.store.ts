import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { type SignInStore, signInInitialState } from './signIn.types';
import { createSignInActions } from './signIn.actions';

// No persistence - this is ephemeral state that resets on page refresh
export const useSignInStore = create<SignInStore>()(
  devtools(
    (set) => ({
      ...signInInitialState,
      ...createSignInActions(set),
    }),
    {
      name: 'sign-in-store',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
);
