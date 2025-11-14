import * as Atoms from '@/atoms';

/**
 * TimelineEmpty
 *
 * Message displayed when timeline has no posts.
 */
export function TimelineEmpty() {
  return (
    <Atoms.Container className="flex items-center justify-center py-8">
      <Atoms.Typography size="md" className="text-muted-foreground">
        No posts found
      </Atoms.Typography>
    </Atoms.Container>
  );
}
