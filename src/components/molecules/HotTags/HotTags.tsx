'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface TagProps {
  name: string;
  count?: number;
}

interface HotTagsProps {
  tags: TagProps[];
  onTagClick?: (tagName: string) => void;
  onSeeAll?: () => void;
  maxTags?: number;
}

export function HotTags({ tags, onTagClick, onSeeAll, maxTags = 5, ...props }: HotTagsProps) {
  const displayTags = tags.slice(0, maxTags);

  const handleSeeAll = () => {
    onSeeAll?.();
  };

  return (
    <Atoms.Container className="flex flex-col gap-2 bg-background" {...props}>
      <Atoms.Heading level={2} size="lg" className="text-muted-foreground font-light">
        Hot Tags
      </Atoms.Heading>

      {/* Tags List */}

      {displayTags.map((tag, index) => (
        <Atoms.Tag key={tag.name} name={tag.name} count={tag.count} onClick={onTagClick} data-testid={`tag-${index}`} />
      ))}

      {/* See All Button */}
      {tags.length > maxTags && (
        <Atoms.Button
          variant="outline"
          onClick={handleSeeAll}
          className="w-full flex items-center justify-center gap-2"
          data-testid="see-all-button"
        >
          <Libs.Tag className="w-4 h-4" />
          <Atoms.Typography size="sm" className="font-bold">
            Explore all
          </Atoms.Typography>
        </Atoms.Button>
      )}
    </Atoms.Container>
  );
}
