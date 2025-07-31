import { ReactNode } from 'react';
import { Card, Container, ContentImage } from '@/components/ui';
import { cn } from '@/libs';

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
    <Card className={cn('p-6 lg:p-12', className)}>
      <Container className={cn('gap-12', layoutClasses[layout])}>
        {image && (
          <ContentImage src={image.src} alt={image.alt} width={image.width} height={image.height} size={image.size} />
        )}
        <Container className=" gap-6 justify-center w-full">{children}</Container>
      </Container>
    </Card>
  );
}
