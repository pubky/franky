import * as Atoms from '@/atoms';

interface TimelineErrorProps {
  message: string;
}

/**
 * TimelineError
 *
 * Error message display for timeline loading errors.
 */
export function TimelineError({ message }: TimelineErrorProps) {
  return (
    <Atoms.Container className="flex justify-center items-center py-4">
      <Atoms.Typography size="sm" className="text-destructive">
        Error loading more posts: {message}
      </Atoms.Typography>
    </Atoms.Container>
  );
}
