import { ProfilePageType, FilterBarPageType } from '@/app/profile/profile.types';

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
