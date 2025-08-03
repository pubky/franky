import { ReactNode } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

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

export function ContentCard({ children, className, image, layout = 'row' }: ContentCardProps) {
  const layoutClasses = {
    row: 'flex-col lg:flex-row',
    column: 'flex-col',
  };

  return (
    <Molecules.Card className={Libs.cn('p-6 lg:p-12', className)}>
      <Atoms.Container className={Libs.cn('gap-12', layoutClasses[layout])}>
        {image && (
          <Molecules.ContentImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            size={image.size}
          />
        )}
        <Atoms.Container className=" gap-6 justify-center w-full">{children}</Atoms.Container>
      </Atoms.Container>
    </Molecules.Card>
  );
}
