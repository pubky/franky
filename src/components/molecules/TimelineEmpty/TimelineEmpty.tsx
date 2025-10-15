import * as Atoms from '@/atoms';

/**
 * TimelineEmpty
 *
 * Message displayed when timeline has no posts.
 */
export function TimelineEmpty() {
  return (
    <Atoms.Container className="flex justify-center items-center py-8">
      <Atoms.Typography size="md" className="text-muted-foreground">
        No posts found
      </Atoms.Typography>
    </Atoms.Container>
  );
}
