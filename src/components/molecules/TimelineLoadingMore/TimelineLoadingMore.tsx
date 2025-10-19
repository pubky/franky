import * as Atoms from '@/atoms';

/**
 * TimelineLoadingMore
 *
 * Loading indicator for when more posts are being fetched.
 */
export function TimelineLoadingMore() {
  return (
    <Atoms.Container className="flex justify-center items-center py-8">
      <Atoms.Typography size="md" className="text-muted-foreground">
        Loading more posts...
      </Atoms.Typography>
    </Atoms.Container>
  );
}
