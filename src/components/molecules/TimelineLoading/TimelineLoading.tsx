import * as Atoms from '@/atoms';

/**
 * TimelineLoading
 *
 * Loading indicator for initial timeline load.
 */
export function TimelineLoading() {
  return (
    <Atoms.Container className="flex justify-center items-center py-8">
      <Atoms.Typography size="md" className="text-muted-foreground">
        Loading posts...
      </Atoms.Typography>
    </Atoms.Container>
  );
}
