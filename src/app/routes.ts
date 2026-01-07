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
}

export enum PROFILE_ROUTES {
  PROFILE = '/profile',
  NOTIFICATIONS = '/profile/notifications',
  POSTS = '/profile/posts',
  REPLIES = '/profile/replies',
  FOLLOWERS = '/profile/followers',
  FOLLOWING = '/profile/following',
  FRIENDS = '/profile/friends',
  UNIQUE_TAGS = '/profile/tagged',
  PROFILE_PAGE = '/profile/profile',
}

export enum SETTINGS_ROUTES {
  ACCOUNT = '/settings/account',
  EDIT = '/settings/edit',
  NOTIFICATIONS = '/settings/notifications',
  PRIVACY_SAFETY = '/settings/privacy-safety',
  MUTED_USERS = '/settings/muted-users',
  LANGUAGE = '/settings/language',
  HELP = '/settings/help',
}

export enum POST_ROUTES {
  POST = '/post',
}

// Public routes are accessible regardless of authentication status.
// This includes routes that need to be accessible during auth transitions (like logout).
export const PUBLIC_ROUTES: string[] = [
  AUTH_ROUTES.LOGOUT,
  // Profile is public to prevent RouteGuard redirect during logout.
  // The profile page components handle unauthenticated state gracefully.
  APP_ROUTES.PROFILE,
];

export const ALLOWED_ROUTES = [
  ONBOARDING_ROUTES.PROFILE,
  APP_ROUTES.HOME,
  APP_ROUTES.SEARCH,
  APP_ROUTES.HOT,
  APP_ROUTES.BOOKMARKS,
  APP_ROUTES.SETTINGS,
  APP_ROUTES.PROFILE,
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

export const NEEDS_PROFILE_CREATION_ROUTES = {
  allowedRoutes: [ONBOARDING_ROUTES.PROFILE],
  redirectTo: ONBOARDING_ROUTES.PROFILE,
};

export const AUTHENTICATED_ROUTES = {
  allowedRoutes: ALLOWED_ROUTES,
  redirectTo: APP_ROUTES.HOME,
};

// Backwards compatibility
export const HOME_ROUTES = {
  HOME: APP_ROUTES.HOME,
};

// ============================================================================
// Profile Route Helpers
// ============================================================================

/**
 * Generates a profile route for a specific user.
 * If no pubky is provided, returns the route for the logged-in user.
 *
 * @param route - The base profile route (e.g., PROFILE_ROUTES.FOLLOWERS)
 * @param pubky - Optional pubky for viewing another user's profile
 * @returns The full route path
 *
 * @example
 * ```ts
 * // For logged-in user
 * getProfileRoute(PROFILE_ROUTES.FOLLOWERS) // => '/profile/followers'
 *
 * // For specific user
 * getProfileRoute(PROFILE_ROUTES.FOLLOWERS, 'pk:abc123') // => '/profile/pk:abc123/followers'
 * ```
 */
export function getProfileRoute(route: PROFILE_ROUTES, pubky?: string): string {
  if (!pubky) {
    return route;
  }

  // Extract the sub-path after /profile
  const subPath = route.replace('/profile', '');

  // For notifications, always return own profile route (notifications only for logged-in user)
  if (route === PROFILE_ROUTES.NOTIFICATIONS || route === PROFILE_ROUTES.PROFILE) {
    // For default profile page on other users, redirect to posts
    if (subPath === '' || subPath === '/notifications') {
      return `/profile/${pubky}/posts`;
    }
  }

  return `/profile/${pubky}${subPath}`;
}

/**
 * Profile route page types for dynamic route generation
 */
export const PROFILE_PAGE_PATHS = {
  posts: '/posts',
  replies: '/replies',
  followers: '/followers',
  following: '/following',
  friends: '/friends',
  tagged: '/tagged',
  profile: '/profile',
} as const;
