import * as React from 'react';
import * as Libs from '@/libs';
import * as Atoms from '@/atoms';

export interface PostTagAddButtonProps {
  /** Callback when button is clicked */
  onClick?: () => void;
  /** Additional className */
  className?: string;
}

export function PostTagAddButton({ onClick, className }: PostTagAddButtonProps) {
  return (
    <Atoms.Button
      onClick={onClick}
      variant="outline"
      size="sm"
      className={Libs.cn(
        'size-8 !min-w-8 rounded-md border-dashed bg-transparent p-0 transition-opacity hover:bg-transparent hover:opacity-80',
        className,
      )}
      aria-label="Add new tag"
    >
      <Libs.Plus className="size-4 opacity-[0.32]" strokeWidth={2} />
    </Atoms.Button>
  );
}
