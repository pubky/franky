'use client';

import * as React from 'react';
import Image from 'next/image';
import * as Libs from '@/libs';

export interface ContentNotFoundProps {
  icon?: React.ReactElement;
  title?: string;
  description?: React.ReactNode | string;
  className?: string;
  children?: React.ReactNode;
  backgroundImage?: string;
  mobileBackgroundImage?: string;
}

export function ContentNotFound({
  icon,
  title,
  description,
  className,
  children,
  backgroundImage,
  mobileBackgroundImage,
}: ContentNotFoundProps) {
  const renderBackgroundImage = (src: string, isMobile: boolean) => (
    <div className={Libs.cn('absolute inset-0 rounded-md overflow-hidden', isMobile ? 'lg:hidden' : 'hidden lg:block')}>
      <Image
        src={src}
        alt={title ? `Empty state background for ${title}` : 'Empty state background'}
        fill
        className="object-contain object-center pointer-events-none"
        sizes="100vw"
      />
    </div>
  );

  return (
    <div
      className={Libs.cn(
        'w-full p-6 relative flex-col justify-center items-center gap-6 inline-flex rounded-md lg:mt-12',
        className,
      )}
    >
      {backgroundImage && (
        <>
          {mobileBackgroundImage ? (
            <>
              {renderBackgroundImage(mobileBackgroundImage, true)}
              {renderBackgroundImage(backgroundImage, false)}
            </>
          ) : (
            <div className="absolute inset-0 rounded-md overflow-hidden">
              <Image
                src={backgroundImage}
                alt={title ? `Empty state background for ${title}` : 'Empty state background'}
                fill
                className="object-contain object-center pointer-events-none"
                sizes="100vw"
              />
            </div>
          )}
        </>
      )}
      <div className="z-[1] inline-flex flex-col gap-6 items-center">
        {icon && (
          <div className="p-6 bg-brand/16 rounded-full justify-center items-center gap-2.5 inline-flex shrink-0">
            {icon}
          </div>
        )}
        {title && (
          <h2 className="text-center break-words text-2xl font-bold leading-normal text-foreground w-full">{title}</h2>
        )}
        {description && (
          <div className="text-center text-base font-medium leading-normal text-muted-foreground w-full">
            {typeof description === 'string' ? <p>{description}</p> : description}
          </div>
        )}
      </div>
      {children && <div className="z-[1]">{children}</div>}
    </div>
  );
}
