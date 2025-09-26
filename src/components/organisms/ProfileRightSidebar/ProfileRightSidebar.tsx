'use client';

import { useLiveQuery } from 'dexie-react-hooks';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Templates from '@/templates';
import * as Core from '@/core';

export const ProfileRightSidebar = ({ pubkySlug }: Templates.TProfilePageProps) => {
  // Function to get random color for a tag
  const getTagColor = () => {
    const colors = [
      'red',
      'blue',
      'green',
      'yellow',
      'purple',
      'pink',
      'indigo',
      'orange',
      'teal',
      'cyan',
      'emerald',
      'rose',
      'violet',
      'amber',
      'lime',
      'sky',
    ];
    const randomIndex = Math.floor(Math.random() * colors.length);
    const color = colors[randomIndex];
    return `bg-${color}-700 text-${color}-100 hover:bg-${color}-600`;
  };

  const userTags = useLiveQuery(() => Core.db.user_tags.get(pubkySlug).then((tags) => tags), [pubkySlug]);

  const renderSkeleton = () => {
    return (
      <aside className="w-56 flex-shrink-0">
        <Atoms.Container className="bg-background rounded-lg p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </Atoms.Container>
      </aside>
    );
  };

  const renderUserTags = (tags: Core.NexusTag[]) => {
    return (
      <div className="space-y-3">
        {tags.map((tag) => (
          <div key={tag.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Atoms.Badge className={getTagColor()}>{tag.label}</Atoms.Badge>
              <span className="text-sm text-muted-foreground">{tag.taggers_count}</span>
            </div>
            <Atoms.Button variant="ghost" size="sm">
              <Libs.Search className="w-4 h-4" />
            </Atoms.Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="space-y-4">
        {/* Tagged As Section */}
        <Atoms.Container className="bg-background rounded-lg p-4">
          <Atoms.Heading level={3} size="sm" className="mb-4 font-semibold">
            Tagged as
          </Atoms.Heading>
          {userTags ? renderUserTags(userTags.tags) : renderSkeleton()}
          <Atoms.Button variant="outline" className="w-full mt-4 gap-2">
            <Libs.Plus className="w-4 h-4" />
            Add Tag
          </Atoms.Button>
        </Atoms.Container>
        {/* Links Section */}
        <Atoms.Container className="bg-background rounded-lg p-4">
          <Atoms.Heading level={3} size="sm" className="mb-4 font-semibold">
            Links
          </Atoms.Heading>
          <div className="text-sm text-muted-foreground">
            <p>No links added yet.</p>
          </div>
        </Atoms.Container>
      </div>
    </aside>
  );
};
