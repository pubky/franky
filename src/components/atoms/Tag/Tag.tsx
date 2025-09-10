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

export function Tag({
  name,
  count,
  clicked = false,
  onClick,
  className,
  'data-testid': dataTestId,
  ...props
}: TagProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const baseColor = Libs.generateRandomColor(name);
  const backgroundColor = Libs.hexToRgba(baseColor, 0.3);
  const borderColor = Libs.hexToRgba(baseColor, 1);

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
        'w-fit flex items-center justify-between px-3 h-8 rounded-md cursor-pointer transition-all duration-200',
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
        <Atoms.Typography size="sm" className="ml-1.5 text-foreground/50 font-medium" data-testid="tag-count">
          {count}
        </Atoms.Typography>
      )}
    </div>
  );
}
