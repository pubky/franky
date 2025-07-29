import Image, { ImageProps } from 'next/image';
import { cn } from '@/libs';

interface ContentImageProps extends Omit<ImageProps, 'className'> {
  className?: string;
  containerClassName?: string;
  size?: 'small' | 'medium' | 'large';
  hiddenOnMobile?: boolean;
}

export function ContentImage({
  className,
  containerClassName,
  size = 'medium',
  hiddenOnMobile = true,
  ...imageProps
}: ContentImageProps) {
  const sizeClasses = {
    small: 'w-full lg:w-[137px]',
    medium: 'w-full lg:w-[192px]',
    large: 'w-full lg:w-[265px]',
  };

  return (
    <div className={cn(sizeClasses[size], hiddenOnMobile ? 'hidden lg:flex' : 'flex', containerClassName)}>
      <Image className={cn('w-full h-auto', className)} {...imageProps} />
    </div>
  );
}
