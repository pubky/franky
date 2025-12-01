'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import {
  BookmarksLeftSidebar,
  BookmarksRightSidebar,
  BookmarksLeftDrawer,
  BookmarksRightDrawer,
  BookmarksLeftDrawerMobile,
  BookmarksRightDrawerMobile,
} from './Bookmarks.sidebars';

export function Bookmarks() {
  return (
    <Organisms.ContentLayout
      leftSidebarContent={<BookmarksLeftSidebar />}
      rightSidebarContent={<BookmarksRightSidebar />}
      leftDrawerContent={<BookmarksLeftDrawer />}
      rightDrawerContent={<BookmarksRightDrawer />}
      leftDrawerContentMobile={<BookmarksLeftDrawerMobile />}
      rightDrawerContentMobile={<BookmarksRightDrawerMobile />}
    >
      <Atoms.Heading level={1} size="xl" className="text-2xl">
        Bookmarks
      </Atoms.Heading>

      <Atoms.Typography size="md" className="text-muted-foreground">
        Access your saved posts and bookmarked content.
      </Atoms.Typography>

      {/* Lorem ipsum content */}
      <div className="mt-4 flex flex-col gap-4">
        <Atoms.Card className="p-6">
          <Atoms.Heading level={3} size="lg" className="mb-4">
            Saved Posts
          </Atoms.Heading>
          <Atoms.Typography size="md" className="text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </Atoms.Typography>
        </Atoms.Card>

        <Atoms.Card className="p-6">
          <Atoms.Heading level={3} size="lg" className="mb-4">
            Collections
          </Atoms.Heading>
          <Atoms.Typography size="md" className="text-muted-foreground">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
            laborum.
          </Atoms.Typography>
        </Atoms.Card>

        <Atoms.Card className="p-6">
          <Atoms.Heading level={3} size="lg" className="mb-4">
            Reading List
          </Atoms.Heading>
          <Atoms.Typography size="md" className="text-muted-foreground">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
            aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </Atoms.Typography>
        </Atoms.Card>
      </div>
    </Organisms.ContentLayout>
  );
}
