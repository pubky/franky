'use client';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Hooks from '@/hooks';

export function Search() {
  // Reset to column layout on mount (this page doesn't support wide)
  Hooks.useLayoutReset();

  return (
    <>
      <Organisms.DialogWelcome />
      <Organisms.ContentLayout
        leftSidebarContent={<Organisms.HomeFeedSidebar />}
        rightSidebarContent={<Organisms.HomeFeedRightSidebar />}
        leftDrawerContent={<Organisms.HomeFeedDrawer />}
        rightDrawerContent={undefined}
      >
        <Atoms.Heading level={1} size="xl" className="text-2xl">
          Search
        </Atoms.Heading>

        <Atoms.Typography size="md" className="text-muted-foreground">
          Welcome to the Search page. Search for posts, users, and tags.
        </Atoms.Typography>

        <div className="mt-4 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Atoms.Card key={i} className="p-6">
              <Atoms.Typography size="md" className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </Atoms.Typography>
            </Atoms.Card>
          ))}
        </div>
      </Organisms.ContentLayout>
    </>
  );
}
