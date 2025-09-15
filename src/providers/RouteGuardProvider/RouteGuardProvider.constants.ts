import * as Hooks from '@/hooks';

// Define which routes each authentication status can access
export const ROUTE_ACCESS_MAP: Hooks.RouteAccessMap = {
  [Hooks.AuthStatus.UNAUTHENTICATED]: {
    allowedRoutes: [
      '/',
      '/sign-in',
      '/onboarding',
      '/onboarding/install',
      '/onboarding/backup',
      '/onboarding/homeserver',
      '/onboarding/pubky',
      '/onboarding/scan',
    ],
    redirectTo: '/',
  },
  [Hooks.AuthStatus.AUTHENTICATED]: {
    allowedRoutes: ['/feed', '/logout'],
    redirectTo: '/feed',
  },
};

// Public routes that don't require any authentication check
export const PUBLIC_ROUTES = ['/logout'];
