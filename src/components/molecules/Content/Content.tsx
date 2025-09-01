import { ReactNode } from 'react';
import Image, { ImageProps } from 'next/image';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface ContentCardProps {
  children?: ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  classNameImage?: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    size?: 'small' | 'medium' | 'large';
  };
  layout?: 'row' | 'column';
}

export function ContentCard({ children, className, classNameImage, image, layout = 'row' }: ContentCardProps) {
  const layoutClasses = {
    row: 'flex-col lg:flex-row',
    column: 'flex-col',
  };

  return (
    <Atoms.Card className={Libs.cn('p-6 md:p-12', className)}>
      <Atoms.Container className={Libs.cn('gap-12', layoutClasses[layout])}>
        {image && (
          <ContentImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            containerClassName={classNameImage}
          />
        )}
        <Atoms.Container className="gap-3 justify-start w-full">{children}</Atoms.Container>
      </Atoms.Container>
    </Atoms.Card>
  );
}

interface ContentContainerProps {
  children: ReactNode;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  gap?: 'sm' | 'md' | 'lg';
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

interface ContentImageProps extends Omit<ImageProps, 'className'> {
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  containerClassName?: string;
  hiddenOnMobile?: boolean;
}

export function ContentImage({
  className,
  containerClassName,
  hiddenOnMobile = true,
  ...imageProps
}: ContentImageProps) {
  return (
    <div
      className={Libs.cn(hiddenOnMobile ? 'hidden lg:flex' : 'flex', containerClassName)}
      style={{ width: imageProps.width, height: imageProps.height }}
    >
      <Image
        data-testid="content-image"
        height={imageProps.height}
        width={imageProps.width}
        className={Libs.cn(className)}
        style={{ objectFit: 'contain' }}
        src={imageProps.src}
        alt={imageProps.alt || 'Image'}
      />
    </div>
  );
}
