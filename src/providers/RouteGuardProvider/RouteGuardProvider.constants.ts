import * as App from '@/app';
// Import directly from types file to avoid circular dependency with @/hooks barrel
import { AuthStatus, type RouteAccessMap } from '@/hooks/useAuthStatus/useAuthStatus.types';

// Define which routes each authentication status can access
export const ROUTE_ACCESS_MAP: RouteAccessMap = {
  [AuthStatus.UNAUTHENTICATED]: App.UNAUTHENTICATED_ROUTES,
  [AuthStatus.AUTHENTICATED]: App.AUTHENTICATED_ROUTES,
};
