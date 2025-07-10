import { getIsAuthenticated, useProfileStore } from '@/core';

export const useIsAuthenticated = () => useProfileStore(getIsAuthenticated);
