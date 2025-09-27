'use client';

import { useLiveQuery } from 'dexie-react-hooks';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Templates from '@/templates';
import * as Core from '@/core';

export const ProfileRightSidebar = ({ pubkySlug }: Templates.TProfilePageProps) => {
  // Function to get random color for a tag
  const getTagColor = () => {
    const colorClasses = [
      'bg-red-700 text-red-100 hover:bg-red-600',
      'bg-blue-700 text-blue-100 hover:bg-blue-600',
      'bg-green-700 text-green-100 hover:bg-green-600',
      'bg-yellow-700 text-yellow-100 hover:bg-yellow-600',
      'bg-purple-700 text-purple-100 hover:bg-purple-600',
      'bg-pink-700 text-pink-100 hover:bg-pink-600',
      'bg-indigo-700 text-indigo-100 hover:bg-indigo-600',
      'bg-orange-700 text-orange-100 hover:bg-orange-600',
      'bg-teal-700 text-teal-100 hover:bg-teal-600',
      'bg-cyan-700 text-cyan-100 hover:bg-cyan-600',
      'bg-emerald-700 text-emerald-100 hover:bg-emerald-600',
      'bg-rose-700 text-rose-100 hover:bg-rose-600',
      'bg-violet-700 text-violet-100 hover:bg-violet-600',
      'bg-amber-700 text-amber-100 hover:bg-amber-600',
      'bg-lime-700 text-lime-100 hover:bg-lime-600',
      'bg-sky-700 text-sky-100 hover:bg-sky-600',
    ];
    const randomIndex = Math.floor(Math.random() * colorClasses.length);
    return colorClasses[randomIndex];
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
