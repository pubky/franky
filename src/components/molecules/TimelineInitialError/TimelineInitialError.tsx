import * as Atoms from '@/atoms';

interface TimelineInitialErrorProps {
  message: string;
}

/**
 * TimelineInitialError
 *
 * Error message display for initial timeline load failures.
 */
export function TimelineInitialError({ message }: TimelineInitialErrorProps) {
  return (
    <Atoms.Container className="flex justify-center items-center py-8">
      <Atoms.Typography size="md" className="text-destructive">
        Error: {message}
      </Atoms.Typography>
    </Atoms.Container>
  );
}
