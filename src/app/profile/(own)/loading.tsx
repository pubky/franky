import * as Atoms from '@/atoms';

export default function ProfileLoading() {
  return (
    <Atoms.Container overrideDefaults={true} className="flex min-h-[400px] items-center justify-center">
      <Atoms.Spinner />
    </Atoms.Container>
  );
}
