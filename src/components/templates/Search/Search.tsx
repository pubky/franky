'use client';

import { useRouter } from 'next/navigation';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as App from '@/app';
import * as Hooks from '@/hooks';

export function Search() {
  const router = useRouter();
  const { layout, setLayout, reach, setReach, sort, setSort, content, setContent } = Core.useHomeStore();

  // Reset to column layout on mount (this page doesn't support wide)
  Hooks.useLayoutReset();

  const handleLogout = () => {
    router.push(App.AUTH_ROUTES.LOGOUT);
  };

  return (
    <>
      <Organisms.DialogWelcome />
      <Organisms.ContentLayout
        leftSidebarContent={
          <>
            <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
            <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
            <div className="sticky top-[100px] flex flex-col gap-6 self-start">
              <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
              <Molecules.FilterLayout selectedTab={layout} onTabChange={setLayout} />
            </div>
          </>
        }
        rightSidebarContent={
          <>
            <Molecules.WhoToFollow />
            <Molecules.ActiveUsers />
            <Molecules.HotTags
              tags={[
                { name: 'bitcoin', count: 1234 },
                { name: 'nostr', count: 892 },
                { name: 'decentralization', count: 567 },
                { name: 'privacy', count: 445 },
                { name: 'web3', count: 321 },
                { name: 'opensource', count: 289 },
              ]}
            />
            <div className="sticky top-[100px] self-start">
              <Organisms.FeedbackCard />
            </div>
          </>
        }
        leftDrawerContent={
          <div className="flex flex-col gap-6">
            <Molecules.FilterReach selectedTab={reach} onTabChange={setReach} />
            <Molecules.FilterSort selectedTab={sort} onTabChange={setSort} />
            <Molecules.FilterLayout selectedTab={layout} onTabChange={setLayout} />
            <Molecules.FilterContent selectedTab={content} onTabChange={setContent} />
          </div>
        }
        rightDrawerContent={undefined}
      >
        <div className="flex items-center justify-between gap-4">
          <Atoms.Heading level={1} size="xl" className="text-2xl">
            Search
          </Atoms.Heading>
          <Atoms.Button id="search-logout-btn" variant="secondary" size="default" onClick={handleLogout}>
            Logout
          </Atoms.Button>
        </div>

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
