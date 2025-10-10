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

export enum APP_ROUTES {
  HOME = '/home',
  SEARCH = '/search',
  HOT = '/hot',
  BOOKMARKS = '/bookmarks',
  SETTINGS = '/settings',
  PROFILE = '/profile',
  PROFILE_EDIT = '/profile/edit',
  PROFILE_POSTS = '/profile/posts',
  PROFILE_REPLIES = '/profile/replies',
  PROFILE_NOTIFICATIONS = '/profile/notifications',
  PROFILE_FOLLOWERS = '/profile/followers',
  PROFILE_FOLLOWING = '/profile/following',
  PROFILE_FRIENDS = '/profile/friends',
  PROFILE_TAGGED = '/profile/tagged',
}

export enum POST_ROUTES {
  POST = '/post',
}

export const PUBLIC_ROUTES: string[] = [AUTH_ROUTES.LOGOUT];

export const ALLOWED_ROUTES = [
  ONBOARDING_ROUTES.PROFILE,
  APP_ROUTES.HOME,
  APP_ROUTES.SEARCH,
  APP_ROUTES.HOT,
  APP_ROUTES.BOOKMARKS,
  APP_ROUTES.SETTINGS,
  APP_ROUTES.PROFILE,
  APP_ROUTES.PROFILE_EDIT,
  APP_ROUTES.PROFILE_POSTS,
  APP_ROUTES.PROFILE_REPLIES,
  APP_ROUTES.PROFILE_NOTIFICATIONS,
  APP_ROUTES.PROFILE_FOLLOWERS,
  APP_ROUTES.PROFILE_FOLLOWING,
  APP_ROUTES.PROFILE_FRIENDS,
  APP_ROUTES.PROFILE_TAGGED,
  POST_ROUTES.POST,
  AUTH_ROUTES.LOGOUT,
];

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
  redirectTo: APP_ROUTES.HOME,
};

// Backwards compatibility
export const HOME_ROUTES = {
  HOME: APP_ROUTES.HOME,
};
