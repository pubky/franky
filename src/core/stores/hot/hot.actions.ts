import { HotStore, HotActions, hotInitialState, HotActionTypes } from './hot.types';
import { ZustandSet } from '../stores.types';

// Actions/Mutators - State modification functions
export const createHotActions = (set: ZustandSet<HotStore>): HotActions => ({
  setReach: (reach) => {
    set({ reach }, false, HotActionTypes.SET_HOT_REACH);
  },

  setTimeframe: (timeframe) => {
    set({ timeframe }, false, HotActionTypes.SET_HOT_TIMEFRAME);
  },

  reset: () => {
    set(hotInitialState, false, HotActionTypes.RESET_HOT);
  },
});
