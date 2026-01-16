export interface UsePublicRouteResult {
  /**
   * Whether the current route is a dynamic public route.
   * True for routes like /post/[userId]/[postId] and /profile/[pubky].
   */
  isPublicRoute: boolean;
}
