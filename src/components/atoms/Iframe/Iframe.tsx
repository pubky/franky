import { forwardRef } from 'react';

import * as Libs from '@/libs';
import * as Types from './Iframe.types';

export const Iframe = forwardRef<HTMLIFrameElement, Types.IframeProps>(function Iframe(
  { 'data-testid': dataTestId, className, width = '100%', height = '315', ...props }: Types.IframeProps,
  ref,
) {
  return (
    <iframe
      ref={ref}
      data-testid={dataTestId || 'iframe'}
      className={Libs.cn('rounded-md', className)}
      loading="lazy"
      allowFullScreen
      width={width}
      height={height}
      {...props}
    />
  );
});
