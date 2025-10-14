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
  EDIT_PROFILE = '/edit-profile',
}

export enum SETTINGS_ROUTES {
  ACCOUNT = '/settings/account',
  NOTIFICATIONS = '/settings/notifications',
  PRIVACY_SAFETY = '/settings/privacy-safety',
  MUTED_USERS = '/settings/muted-users',
  LANGUAGE = '/settings/language',
  HELP = '/settings/help',
}

export enum PROFILE_ROUTES {
  NOTIFICATIONS = '/profile/notifications',
  POSTS = '/profile/posts',
  REPLIES = '/profile/replies',
  FOLLOWERS = '/profile/followers',
  FOLLOWING = '/profile/following',
  FRIENDS = '/profile/friends',
  TAGGED = '/profile/tagged',
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
  APP_ROUTES.EDIT_PROFILE,
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

// Allow settings subroutes
export const SETTINGS_SUBROUTES = Object.values(SETTINGS_ROUTES);
export const PROFILE_SUBROUTES = Object.values(PROFILE_ROUTES);

// Backwards compatibility
export const HOME_ROUTES = {
  HOME: APP_ROUTES.HOME,
};
