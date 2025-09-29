export const ROOT_ROUTES = '/';

export enum ONBOARDING_ROUTES {
  BACKUP = '/onboarding/backup',
  HOMESERVER = '/onboarding/homeserver',
  INSTALL = '/onboarding/install',
  PROFILE = '/onboarding/profile',
  PUBKY = '/onboarding/pubky',
  SCAN = '/onboarding/scan',
}

export enum AUTH_ROUTES {
  SIGN_IN = '/sign-in',
  LOGOUT = '/logout',
}

export enum FEED_ROUTES {
  FEED = '/feed',
}

export enum POST_ROUTES {
  POST = '/post',
}

export const PUBLIC_ROUTES: string[] = [AUTH_ROUTES.LOGOUT];

export const ALLOWED_ROUTES = [ONBOARDING_ROUTES.PROFILE, FEED_ROUTES.FEED, POST_ROUTES.POST, AUTH_ROUTES.LOGOUT];

// Route guard configurations for different authentication states
export const UNAUTHENTICATED_ROUTES = {
  allowedRoutes: [
    ROOT_ROUTES,
    AUTH_ROUTES.SIGN_IN,
    ONBOARDING_ROUTES.INSTALL,
    ONBOARDING_ROUTES.SCAN,
    ONBOARDING_ROUTES.PUBKY,
    ONBOARDING_ROUTES.BACKUP,
    ONBOARDING_ROUTES.HOMESERVER,
    AUTH_ROUTES.LOGOUT,
  ],
  redirectTo: ROOT_ROUTES,
};

export const AUTHENTICATED_ROUTES = {
  allowedRoutes: ALLOWED_ROUTES,
  redirectTo: FEED_ROUTES.FEED,
};
