import { ReactNode } from 'react';
import Image, { ImageProps } from 'next/image';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface ContentCardProps {
  children?: ReactNode;
  className?: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    size?: 'small' | 'medium' | 'large';
  };
  layout?: 'row' | 'column';
}

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  gap?: 'sm' | 'md' | 'lg';
}

interface ContentImageProps extends Omit<ImageProps, 'className'> {
  className?: string;
  containerClassName?: string;
  size?: 'small' | 'medium' | 'large';
  hiddenOnMobile?: boolean;
}

export function ContentCard({ children, className, image, layout = 'row' }: ContentCardProps) {
  const layoutClasses = {
    row: 'flex-col lg:flex-row',
    column: 'flex-col',
  };

  return (
    <Atoms.Card className={Libs.cn('p-6 lg:p-12', className)}>
      <Atoms.Container className={Libs.cn('gap-12', layoutClasses[layout])}>
        {image && (
          <ContentImage src={image.src} alt={image.alt} width={image.width} height={image.height} size={image.size} />
        )}
        <Atoms.Container className="gap-6 justify-start w-full">{children}</Atoms.Container>
      </Atoms.Container>
    </Atoms.Card>
  );
}

export function ContentContainer({ children, className, maxWidth = 'lg', gap = 'md' }: ContentContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-[588px]',
    md: 'max-w-[800px]',
    lg: 'max-w-[1200px]',
    xl: 'max-w-[1400px]',
  };

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  return (
    <Atoms.Container className={Libs.cn(maxWidthClasses[maxWidth], gapClasses[gap], className)}>
      {children}
    </Atoms.Container>
  );
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
    medium: 'w-full lg:w-[228px]',
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
