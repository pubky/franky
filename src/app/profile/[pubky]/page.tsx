import * as Templates from '@/templates';

/**
 * Default page for /profile/[pubky]/ route
 *
 * Unlike the own profile which shows notifications, this shows the user's
 * posts by default since notifications only make sense for the logged-in user.
 */
export default function DynamicProfilePage() {
  return <Templates.ProfilePagePosts />;
}
