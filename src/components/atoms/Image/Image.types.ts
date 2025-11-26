import type NextImage from 'next/image';
import type * as React from 'react';

export interface ImageProps extends Omit<React.ComponentProps<typeof NextImage>, 'src' | 'alt'> {
  src: string;
  alt: string;
  fill?: boolean;
  unoptimized?: boolean;
  width?: number;
  height?: number;
}
