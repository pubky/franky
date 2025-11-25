import * as React from 'react';

import { cn } from '@/libs';

const Anchor = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <a ref={ref} className={cn(className)} {...props}>
        {children}
      </a>
    );
  },
);

Anchor.displayName = 'Anchor';

export { Anchor };
