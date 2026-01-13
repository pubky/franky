export const ROOT_ROUTES = '/';

export enum ONBOARDING_ROUTES {
  BACKUP = '/onboarding/backup',
  INSTALL = '/onboarding/install',
  PROFILE = '/onboarding/profile',
  PUBKY = '/onboarding/pubky',
  SCAN = '/onboarding/scan',
  HUMAN = '/onboarding/human',
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
// Note: Dynamic public routes like /profile/[pubky] and /post/[userId]/[postId]
// are handled by isDynamicPublicRoute() in RouteGuardProvider.
export const PUBLIC_ROUTES: string[] = [AUTH_ROUTES.LOGOUT];

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
    ONBOARDING_ROUTES.HUMAN,
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
// Dynamic Public Route Detection
// ============================================================================

/**
 * Own profile sub-routes that should NOT be treated as public.
 * These are routes like /profile/posts that belong to the logged-in user.
 */
const OWN_PROFILE_SUB_ROUTES = [
  'posts',
  'replies',
  'followers',
  'following',
  'friends',
  'tagged',
  'notifications',
  'profile',
] as const;

/**
 * Minimum length for a segment to be considered a pubky identifier.
 * Pubky strings are typically 52+ characters, while route names are short.
 */
const MIN_PUBKY_LENGTH = 20;

/**
 * Checks if a pathname is a dynamic public route that should be accessible
 * without authentication.
 *
 * Dynamic public routes are routes with URL parameters that are publicly viewable:
 * - /post/[userId]/[postId] - viewing a single post
 * - /profile/[pubky] - viewing another user's profile
 * - /profile/[pubky]/posts, /profile/[pubky]/followers, etc.
 *
 * Own profile routes (/profile/posts, /profile/followers, etc.) are NOT public
 * as they require authentication to know which user's data to show.
 */
export function isDynamicPublicRoute(pathname: string): boolean {
  // Match /post/[userId]/[postId] - single post view
  if (/^\/post\/[^/]+\/[^/]+$/.test(pathname)) {
    return true;
  }

  // Match /profile/[pubky] routes (viewing another user's profile)
  const profileMatch = pathname.match(/^\/profile\/([^/]+)(\/.*)?$/);
  if (profileMatch) {
    const segment = profileMatch[1];

    // Own profile sub-routes use short names
    // Pubky strings are much longer (typically 52+ chars)
    const isOwnProfileRoute = OWN_PROFILE_SUB_ROUTES.includes(segment as (typeof OWN_PROFILE_SUB_ROUTES)[number]);

    if (!isOwnProfileRoute && segment.length > MIN_PUBKY_LENGTH) {
      return true;
    }
  }

  return false;
}

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
