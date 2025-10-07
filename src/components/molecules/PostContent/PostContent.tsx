import * as React from 'react';
import * as Libs from '@/libs';

export interface PostContentProps {
  text: string;
  className?: string;
}

export function PostContent({ text, className }: PostContentProps) {
  return (
    <div className={Libs.cn('flex flex-col gap-3 rounded-2xl', className)}>
      <p className="text-base leading-6 font-medium text-secondary-foreground">{text}</p>
    </div>
  );
}
