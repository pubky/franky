import * as Atoms from '@/atoms';

export default function ProfileLoading() {
  return (
    <Atoms.Container overrideDefaults={true} className="flex min-h-[400px] items-center justify-center">
      <Atoms.Container
        overrideDefaults={true}
        className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand"
      ></Atoms.Container>
    </Atoms.Container>
  );
}
