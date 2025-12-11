import * as Atoms from '@/atoms';

export interface ProfilePageLayoutWrapperProps {
  children: React.ReactNode;
}

export function ProfilePageLayoutWrapper({ children }: ProfilePageLayoutWrapperProps): React.ReactElement {
  return (
    <Atoms.Container
      overrideDefaults={true}
      className="mx-auto mt-6 w-full max-w-sm px-6 pt-0 sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:mt-0 xl:max-w-6xl xl:px-0"
    >
      {children}
    </Atoms.Container>
  );
}
