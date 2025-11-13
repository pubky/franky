'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface TagProps {
  name: string;
  count?: number;
  clicked?: boolean;
  onClick?: (tagName: string) => void;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  'data-testid'?: string;
}

export const Tag = ({
  name,
  count,
  clicked = false,
  onClick,
  className,
  'data-testid': dataTestId,
  ...props
}: TagProps) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const { backgroundColor, borderColor } = React.useMemo(() => {
    const base = Libs.generateRandomColor(name);
    return {
      backgroundColor: Libs.hexToRgba(base, 0.3),
      borderColor: Libs.hexToRgba(base, 1),
    };
  }, [name]);

  const handleClick = () => {
    onClick?.(name);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={Libs.cn(
        'flex h-8 w-fit cursor-pointer items-center justify-between rounded-md px-3 transition-all duration-200',
        className,
      )}
      style={{
        backgroundColor: backgroundColor,
        border: clicked ? `1px solid ${borderColor}` : '1px solid transparent',
        boxShadow: !clicked && isHovered ? `inset 0 0 10px 2px ${borderColor}` : undefined,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid={dataTestId || 'tag'}
      {...props}
    >
      <Atoms.Typography size="sm" data-testid="tag-name">
        {name}
      </Atoms.Typography>

      {count !== undefined && (
        <Atoms.Typography size="sm" className="ml-1.5 font-medium text-foreground/50" data-testid="tag-count">
          {count}
        </Atoms.Typography>
      )}
    </div>
  );
};
