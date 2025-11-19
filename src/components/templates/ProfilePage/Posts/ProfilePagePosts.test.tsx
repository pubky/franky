import { createProfilePageTests } from '../test-utils';
import { ProfilePagePosts } from './ProfilePagePosts';

createProfilePageTests({
  pageName: 'Posts',
  Component: ProfilePagePosts,
  hasMultipleParagraphs: true,
});
