'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface FeedItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
}

export interface FeedSectionProps {
  feeds?: FeedItem[];
  showCreateButton?: boolean;
  className?: string;
}

export function FeedSection({
  feeds: customFeeds,
  showCreateButton = true,
  className,
}: FeedSectionProps): React.ReactElement {
  const defaultFeeds: FeedItem[] = [
    { icon: Libs.UsersRound2, label: 'Following' },
    { icon: Libs.Bitcoin, label: 'Based Bitcoin' },
    { icon: Libs.Pickaxe, label: 'Mining Industry' },
    { icon: Libs.Zap, label: 'Lightning Network' },
    { icon: Libs.Palette, label: 'Design UX/UI' },
  ];

  const feeds = customFeeds || defaultFeeds;

  return (
    <Atoms.FilterRoot className={className}>
      <Atoms.FilterHeader title="Feed" />

      <Atoms.FilterList>
        {feeds.map((feed) => {
          const Icon = feed.icon;
          return (
            <Atoms.FilterItem key={feed.label} isSelected={false} onClick={() => {}}>
              <Atoms.FilterItemIcon icon={Icon} />
              <Atoms.FilterItemLabel>{feed.label}</Atoms.FilterItemLabel>
            </Atoms.FilterItem>
          );
        })}

        {showCreateButton && (
          <Atoms.FilterItem isSelected={false} onClick={() => {}}>
            <Atoms.FilterItemIcon icon={Libs.Plus} />
            <Atoms.FilterItemLabel>Create Feed</Atoms.FilterItemLabel>
          </Atoms.FilterItem>
        )}
      </Atoms.FilterList>
    </Atoms.FilterRoot>
  );
}
