import Image, { ImageProps } from 'next/image';
import * as Libs from '@/libs';

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
    <div className={Libs.cn(sizeClasses[size], hiddenOnMobile ? 'hidden lg:flex' : 'flex', containerClassName)}>
      <Image
        data-testid="content-image"
        data-size={size}
        className={Libs.cn('w-full h-auto', className)}
        {...imageProps}
        alt={imageProps.alt || 'Image'}
      />
    </div>
  );
}
