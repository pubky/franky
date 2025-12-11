'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import type { NewPostsButtonProps } from './NewPostsButton.types';

/**
 * NewPostsButton
 *
 * A prominent button that appears when new posts are available.
 * When at the top of the page, it appears below the input, full width.
 * When scrolled down, it becomes a fixed floating button at the top.
 *
 * @example
 * ```tsx
 * <NewPostsButton
 *   count={5}
 *   onClick={() => handleNewPosts()}
 *   visible={hasNewPosts}
 *   isScrolled={isScrolled}
 * />
 * ```
 */
export function NewPostsButton({
  count,
  onClick,
  visible,
  isScrolled = false,
}: NewPostsButtonProps): React.ReactElement | null {
  if (!visible || count === 0) return null;

  return (
    <Atoms.Button
      variant={isScrolled ? 'brand' : 'default'}
      onClick={onClick}
      data-testid="new-posts-button"
      className={Libs.cn(
        'animate-in fade-in slide-in-from-left-2',
        // When scrolled: fixed position floating below main header (uses --header-offset-main CSS variable)
        isScrolled && 'fixed top-(--header-offset-main) left-1/2 z-30 -translate-x-1/2 shadow-lg',
        // When at top: full width below input
        !isScrolled && 'w-full',
      )}
    >
      <Libs.ArrowUp className={Libs.cn('h-4 w-4', !isScrolled && 'animate-bounce')} />
      <span>
        See {count} new {count === 1 ? 'post' : 'posts'}
      </span>
    </Atoms.Button>
  );
}
