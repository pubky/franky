import * as Atoms from '@/atoms';
import { cn } from '@/libs';

interface ThreadLineProps {
  className?: string;
  'data-testid'?: string;
}

/**
 * Encapsulates the vertical thread line functionality
 * Used as a building block for thread connectors
 */
export const ThreadLine = ({ className, 'data-testid': dataTestId }: ThreadLineProps) => {
  return (
    <Atoms.Container
      className={cn('min-h-px w-full min-w-px shrink-0 grow basis-0 border-l border-border', className)}
      overrideDefaults
      data-testid={dataTestId}
    />
  );
};
