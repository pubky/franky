'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PROFILE_ROUTES } from '@/app';
import { PROFILE_PAGE_TYPES, ProfilePageType, FilterBarPageType } from '@/app/profile/types';

/**
 * Profile routes configuration - single source of truth
 * Maps page types to their primary route and optional aliases
 */
const PROFILE_ROUTES_CONFIG: Record<
  ProfilePageType,
  {
    /** Primary route for this page type */
    route: string;
    /** Alternative routes that also map to this page type */
    aliases?: string[];
  }
> = {
  [PROFILE_PAGE_TYPES.NOTIFICATIONS]: {
    route: PROFILE_ROUTES.PROFILE,
    aliases: [PROFILE_ROUTES.NOTIFICATIONS],
  },
  [PROFILE_PAGE_TYPES.POSTS]: {
    route: PROFILE_ROUTES.POSTS,
  },
  [PROFILE_PAGE_TYPES.REPLIES]: {
    route: PROFILE_ROUTES.REPLIES,
  },
  [PROFILE_PAGE_TYPES.FOLLOWERS]: {
    route: PROFILE_ROUTES.FOLLOWERS,
  },
  [PROFILE_PAGE_TYPES.FOLLOWING]: {
    route: PROFILE_ROUTES.FOLLOWING,
  },
  [PROFILE_PAGE_TYPES.FRIENDS]: {
    route: PROFILE_ROUTES.FRIENDS,
  },
  [PROFILE_PAGE_TYPES.UNIQUE_TAGS]: {
    route: PROFILE_ROUTES.UNIQUE_TAGS,
  },
  [PROFILE_PAGE_TYPES.PROFILE]: {
    route: PROFILE_ROUTES.PROFILE_PAGE,
  },
};

/**
 * Derives the page-to-path mapping from the configuration
 * Maps routes (and their aliases) to page types
 */
const derivePagePathMap = (): Record<string, ProfilePageType> => {
  const map: Record<string, ProfilePageType> = {};

  for (const [pageType, config] of Object.entries(PROFILE_ROUTES_CONFIG)) {
    // Map primary route
    map[config.route] = pageType as ProfilePageType;

    // Map aliases if they exist
    if (config.aliases) {
      for (const alias of config.aliases) {
        map[alias] = pageType as ProfilePageType;
      }
    }
  }

  return map;
};

/**
 * Derives the route mapping from the configuration
 * Maps page types to their primary routes
 */
const deriveRouteMap = (): Record<ProfilePageType, string> => {
  const map: Record<ProfilePageType, string> = {} as Record<ProfilePageType, string>;

  for (const [pageType, config] of Object.entries(PROFILE_ROUTES_CONFIG)) {
    map[pageType as ProfilePageType] = config.route;
  }

  return map;
};

/**
 * Page-to-path mapping for profile navigation (derived from config)
 */
const PAGE_PATH_MAP = derivePagePathMap();

/**
 * Route mapping for profile pages (derived from config)
 */
const ROUTE_MAP = deriveRouteMap();

/**
 * Return type for the useProfileNavigation hook
 */
export interface UseProfileNavigationReturn {
  /**
   * The currently active profile page based on the current pathname
   */
  activePage: ProfilePageType;
  /**
   * The active page for the filter bar (excludes PROFILE page type)
   */
  filterBarActivePage: FilterBarPageType;
  /**
   * Navigate to a specific profile page
   */
  navigateToPage: (page: ProfilePageType) => void;
}

/**
 * Custom hook for managing profile page navigation
 *
 * This hook encapsulates all navigation logic for profile pages including:
 * - Determining the active page based on current pathname
 * - Mapping between page types and routes
 * - Providing navigation functionality
 *
 * @returns {UseProfileNavigationReturn} Navigation state and handlers
 *
 * @example
 * ```typescript
 * const { activePage, filterBarActivePage, navigateToPage } = useProfileNavigation();
 *
 * // Navigate to posts page
 * navigateToPage(PROFILE_PAGE_TYPES.POSTS);
 *
 * // Use active page for conditional rendering
 * if (activePage === PROFILE_PAGE_TYPES.POSTS) {
 *   // Render posts
 * }
 * ```
 */
export function useProfileNavigation(): UseProfileNavigationReturn {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Determine the active page from the current pathname
   * Defaults to NOTIFICATIONS if pathname is not in the map
   */
  const activePage = useMemo(() => {
    return PAGE_PATH_MAP[pathname] || PROFILE_PAGE_TYPES.NOTIFICATIONS;
  }, [pathname]);

  /**
   * Calculate the filter bar active page
   * The filter bar doesn't show the PROFILE page type, so we map it to NOTIFICATIONS
   */
  const filterBarActivePage = useMemo(() => {
    return activePage === PROFILE_PAGE_TYPES.PROFILE
      ? PROFILE_PAGE_TYPES.NOTIFICATIONS
      : (activePage as FilterBarPageType);
  }, [activePage]);

  /**
   * Navigate to a specific profile page
   * Maps the page type to its corresponding route and pushes to router
   */
  const navigateToPage = useCallback(
    (page: ProfilePageType) => {
      const route = ROUTE_MAP[page];
      router.push(route);
    },
    [router],
  );

  return {
    activePage,
    filterBarActivePage,
    navigateToPage,
  };
}
