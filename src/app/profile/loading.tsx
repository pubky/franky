import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export default function ProfileLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Atoms.Container className="items-center gap-4">
        <Libs.Loader2 className="h-8 w-8 text-brand animate-spin" />
        <Atoms.Typography size="md" className="text-muted-foreground">
          Loading...
        </Atoms.Typography>
      </Atoms.Container>
    </div>
  );
}
