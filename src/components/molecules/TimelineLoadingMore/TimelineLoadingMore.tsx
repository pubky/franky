import * as Atoms from '@/atoms';

/**
 * TimelineLoadingMore
 *
 * Loading indicator for when more posts are being fetched.
 */
export function TimelineLoadingMore(): React.ReactElement {
  return (
    <Atoms.Container className="flex items-center justify-center py-8">
      <Atoms.Typography size="md" className="text-muted-foreground">
        Loading more posts...
      </Atoms.Typography>
    </Atoms.Container>
  );
}
