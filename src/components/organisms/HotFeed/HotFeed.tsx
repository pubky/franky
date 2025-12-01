'use client';

import { useState } from 'react';

import * as Atoms from '@/atoms';
import * as Organisms from '@/organisms';
import * as Core from '@/core';
import * as Hooks from '@/hooks';

/**
 * HotFeed
 *
 * Organism that manages the Hot feed page state and layout.
 * Handles reach filter (from global store) and timeframe filter (local state).
 */
export function HotFeed() {
  const { reach, setReach } = Core.useHomeStore();
  const [timeframe, setTimeframe] = useState<Organisms.TimeframeTab>('today');

  // Reset to column layout on mount (this page doesn't support wide)
  Hooks.useLayoutReset();

  return (
    <Organisms.ContentLayout
      showRightMobileButton={false}
      leftSidebarContent={
        <Organisms.HotFeedSidebar reach={reach} setReach={setReach} timeframe={timeframe} setTimeframe={setTimeframe} />
      }
      rightSidebarContent={<Organisms.HotFeedRightSidebar />}
      leftDrawerContent={
        <Organisms.HotFeedDrawer reach={reach} setReach={setReach} timeframe={timeframe} setTimeframe={setTimeframe} />
      }
      rightDrawerContent={<Organisms.HotFeedRightDrawer />}
    >
      <Atoms.Heading level={1} size="xl" className="text-2xl">
        Hot
      </Atoms.Heading>

      <Atoms.Typography size="md" className="text-muted-foreground">
        Discover trending posts and popular content from across the network.
      </Atoms.Typography>

      {/* Lorem ipsum content */}
      <div className="mt-4 flex flex-col gap-4">
        <Atoms.Card className="p-6">
          <Atoms.Heading level={3} size="lg" className="mb-4">
            What&apos;s Hot
          </Atoms.Heading>
          <Atoms.Typography size="md" className="text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </Atoms.Typography>
        </Atoms.Card>

        <Atoms.Card className="p-6">
          <Atoms.Heading level={3} size="lg" className="mb-4">
            Trending Topics
          </Atoms.Heading>
          <Atoms.Typography size="md" className="text-muted-foreground">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
            laborum.
          </Atoms.Typography>
        </Atoms.Card>

        <Atoms.Card className="p-6">
          <Atoms.Heading level={3} size="lg" className="mb-4">
            Popular Posts
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
