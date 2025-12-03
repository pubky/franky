'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

export interface TagProps {
  name: string;
  count?: number;
}

interface HotTagsProps {
  tags: TagProps[];
  onTagClick?: (tagName: string) => void;
  onAddTag?: () => void;
  onSeeAll?: () => void;
  maxTags?: number;
  className?: string;
}

/**
 * HotTags
 *
 * Sidebar section showing trending tags.
 * Uses SidebarSection for consistent layout.
 */
export function HotTags({ tags, onTagClick, onAddTag, onSeeAll, maxTags = 5, className }: HotTagsProps) {
  const displayTags = tags.slice(0, maxTags);

  return (
    <Molecules.SidebarSection
      title="Hot tags"
      headerActionIcon={onAddTag ? Libs.Plus : undefined}
      onHeaderAction={onAddTag}
      headerActionLabel="Add tag"
      footerIcon={Libs.Tag}
      footerText="Explore all"
      onFooterClick={onSeeAll}
      footerTestId="see-all-button"
      className={className}
      data-testid="hot-tags"
    >
      <Atoms.Container overrideDefaults className="flex w-full flex-col gap-2">
        {displayTags.map((tag, index) => (
          <Atoms.Tag
            key={tag.name}
            name={tag.name}
            count={tag.count}
            onClick={onTagClick}
            data-testid={`tag-${index}`}
          />
        ))}
      </Atoms.Container>
    </Molecules.SidebarSection>
  );
}
