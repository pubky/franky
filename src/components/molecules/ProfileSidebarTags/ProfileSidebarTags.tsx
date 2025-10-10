'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ProfileTag {
  label: string;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onSearchClick?: () => void;
}

export interface ProfileSidebarTagsProps {
  tags: ProfileTag[];
  onAddTag?: () => void;
  isLoading?: boolean;
  className?: string;
  'data-testid'?: string;
}

export function ProfileSidebarTags({
  tags,
  onAddTag,
  isLoading = false,
  className,
  'data-testid': dataTestId,
}: ProfileSidebarTagsProps) {
  return (
    <Atoms.FilterRoot className={className} data-testid={dataTestId || 'profile-sidebar-tags'}>
      <Atoms.FilterHeader title="Tagged as" />
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Libs.Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          {tags.length > 0 ? (
            <div className="flex flex-col gap-2">
              {tags.map((tag, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Atoms.Tag
                    name={tag.label}
                    clicked={tag.isSelected}
                    onClick={() => tag.onClick?.()}
                    className="flex-shrink-0"
                  />
                  {tag.onSearchClick && (
                    <Atoms.Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={tag.onSearchClick}
                      data-testid={`profile-tag-search-${index}`}
                    >
                      <Libs.Search className="w-4 h-4" />
                    </Atoms.Button>
                  )}
                  {tag.count !== undefined && (
                    <Atoms.Typography size="sm" className="text-muted-foreground ml-auto">
                      {tag.count}
                    </Atoms.Typography>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Atoms.Typography size="sm" className="text-muted-foreground">
              No tags yet
            </Atoms.Typography>
          )}

          {onAddTag && (
            <Atoms.Button
              variant="secondary"
              size="sm"
              onClick={onAddTag}
              className="w-full mt-2"
              data-testid="profile-add-tag-btn"
            >
              <Libs.Tag className="mr-2 h-4 w-4" />
              Add Tag
            </Atoms.Button>
          )}
        </div>
      )}
    </Atoms.FilterRoot>
  );
}
