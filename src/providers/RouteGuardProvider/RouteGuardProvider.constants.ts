import * as Hooks from '@/hooks';
import * as App from '@/app';

// Define which routes each authentication status can access
export const ROUTE_ACCESS_MAP: Hooks.RouteAccessMap = {
  [Hooks.AuthStatus.UNAUTHENTICATED]: App.UNAUTHENTICATED_ROUTES,
  [Hooks.AuthStatus.AUTHENTICATED]: App.AUTHENTICATED_ROUTES,
};
