import * as React from 'react';
import { cn } from '@/libs';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(({ className, src, alt, ...props }, ref) => {
  return <img ref={ref} src={src} alt={alt} className={cn('h-auto max-w-full', className)} {...props} />;
});

Image.displayName = 'Image';
