import * as Atoms from '@/atoms';

/**
 * TimelineEndMessage
 *
 * Message displayed when user has reached the end of the timeline.
 */
export function TimelineEndMessage() {
  return (
    <Atoms.Container className="flex justify-center items-center py-8">
      <Atoms.Typography size="md" className="text-muted-foreground">
        You&apos;ve reached the end! 🎉
      </Atoms.Typography>
    </Atoms.Container>
  );
}
