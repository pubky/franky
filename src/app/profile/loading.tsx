import * as Atoms from '@/atoms';

export default function ProfileLoading() {
  return (
    <Atoms.Container className="flex flex-col gap-4">
      <Atoms.Card className="p-6 animate-pulse">
        <div className="h-20 bg-muted rounded mb-4" />
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </Atoms.Card>
      <Atoms.Card className="p-6 animate-pulse">
        <div className="h-20 bg-muted rounded mb-4" />
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </Atoms.Card>
    </Atoms.Container>
  );
}

