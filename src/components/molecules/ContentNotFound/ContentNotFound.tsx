'use client';

import * as React from 'react';
import * as Libs from '@/libs';

export interface ContentNotFoundProps {
  icon?: React.ReactElement;
  title?: string;
  description?: React.ReactNode | string;
  className?: string;
  children?: React.ReactNode;
}

export function ContentNotFound({ icon, title, description, className, children }: ContentNotFoundProps) {
  return (
    <div className={Libs.cn('w-full p-12 relative flex-col justify-center items-center gap-6 inline-flex', className)}>
      <div className="z-[1] inline-flex flex-col gap-6 items-center">
        {icon && (
          <div className="p-4 bg-brand/10 rounded-full justify-center items-center gap-2.5 inline-flex">{icon}</div>
        )}
        {title && (
          <h2 className="text-center break-words text-2xl font-bold leading-normal text-foreground">{title}</h2>
        )}
        {description && (
          <p className="text-center text-base font-medium leading-normal text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
