'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { PostPageBreadcrumbProps } from './PostPageBreadcrumb.types';
import type { Ancestor } from '@/hooks/usePostAncestors/usePostAncestors.types';

/**
 * PostPageBreadcrumb Organism
 *
 * Renders breadcrumb navigation for post reply chains.
 * When there are more than 3 ancestors, it truncates the middle items
 * into a dropdown menu showing: first > ... > second-to-last > last
 *
 * @example
 * ```tsx
 * <PostPageBreadcrumb
 *   ancestors={[...]}
 *   userDetailsMap={new Map([['user1', 'John']])}
 *   onNavigate={(postId) => router.push(`/post/${postId}`)}
 * />
 * ```
 */
export function PostPageBreadcrumb({ ancestors, userDetailsMap, onNavigate }: PostPageBreadcrumbProps) {
  const ITEMS_TO_DISPLAY = 3;
  const shouldTruncate = ancestors.length > ITEMS_TO_DISPLAY;

  // Render a single breadcrumb item
  const renderItem = (ancestor: Ancestor, index: number, arrayLength: number) => {
    const isLast = index === arrayLength - 1;
    const userName = userDetailsMap.get(ancestor.userId) || 'Unknown';

    return (
      <React.Fragment key={ancestor.postId}>
        <Molecules.BreadcrumbItem
          variant={isLast ? 'current' : 'link'}
          onClick={isLast ? undefined : () => onNavigate(ancestor.postId)}
          data-testid={`breadcrumb-item-${index}`}
        >
          {userName}
        </Molecules.BreadcrumbItem>
        {!isLast && <Molecules.BreadcrumbSeparator size="sm" />}
      </React.Fragment>
    );
  };

  return (
    <Molecules.Breadcrumb size="md" data-testid="post-breadcrumb">
      {/* Case 1: No Truncation needed */}
      {!shouldTruncate && ancestors.map((ancestor, index) => renderItem(ancestor, index, ancestors.length))}

      {/* Case 2: Truncation Active */}
      {shouldTruncate && (
        <>
          {/* 1. First Item */}
          {renderItem(ancestors[0], 0, ancestors.length)}

          {/* 2. Dropdown for Middle Items - using raw li to avoid nested button */}
          <li className="flex items-center justify-center gap-2.5 text-muted-foreground">
            <Atoms.DropdownMenu>
              <Atoms.DropdownMenuTrigger
                className="flex items-center gap-1 outline-none"
                data-testid="breadcrumb-ellipsis-trigger"
              >
                <Molecules.BreadcrumbEllipsis className="h-4 w-4" />
              </Atoms.DropdownMenuTrigger>
              <Atoms.DropdownMenuContent align="start" data-testid="breadcrumb-dropdown-content">
                {ancestors.slice(1, -2).map((ancestor) => (
                  <Atoms.DropdownMenuItem
                    key={ancestor.postId}
                    onClick={() => onNavigate(ancestor.postId)}
                    data-testid={`breadcrumb-dropdown-item-${ancestor.postId}`}
                  >
                    {userDetailsMap.get(ancestor.userId) || 'Unknown'}
                  </Atoms.DropdownMenuItem>
                ))}
              </Atoms.DropdownMenuContent>
            </Atoms.DropdownMenu>
          </li>
          <Molecules.BreadcrumbSeparator size="sm" />

          {/* 3. Last Two Items */}
          {ancestors.slice(-2).map((ancestor, i) => {
            // Calculate the actual index in the original array for correct "isLast" logic
            const actualIndex = ancestors.length - 2 + i;
            return renderItem(ancestor, actualIndex, ancestors.length);
          })}
        </>
      )}
    </Molecules.Breadcrumb>
  );
}
