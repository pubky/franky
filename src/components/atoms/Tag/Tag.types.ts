import * as React from 'react';

export interface TagProps {
  name: string;
  count?: number;
  clicked?: boolean;
  onClick?: (tagName: string) => void;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  /** Maximum characters to display before truncating (adds "..." if truncated) */
  maxLength?: number;
  'data-testid'?: string;
}
