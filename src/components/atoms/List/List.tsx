import { ReactNode } from 'react';
import { cn } from '@/libs';

interface ListProps {
  type?: 'ul' | 'ol';
  elements: ReactNode[];
  className?: string;
  style?: 'disc' | 'decimal' | 'circle' | 'square' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
}

export function List({ type = 'ul', elements, className, style }: ListProps) {
  const Tag = type;

  const styleClasses = {
    disc: 'list-disc',
    decimal: 'list-decimal',
    circle: 'list-circle',
    square: 'list-square',
    'lower-alpha': 'list-lower-alpha',
    'upper-alpha': 'list-upper-alpha',
    'lower-roman': 'list-lower-roman',
    'upper-roman': 'list-upper-roman',
  };

  const defaultStyle = type === 'ul' ? 'disc' : 'decimal';

  return (
    <Tag
      data-testid={`list-${type}`}
      className={cn('ml-6 text-lg text-muted-foreground font-normal', styleClasses[style || defaultStyle], className)}
    >
      {elements.map((element, index) => (
        <li key={index}>{element}</li>
      ))}
    </Tag>
  );
}
