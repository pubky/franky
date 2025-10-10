import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Install() {
  return (
    <Atoms.Container
      size="container"
      className="min-h-dvh items-stretch gap-6 px-6 pb-0 pt-4 lg:gap-10 lg:min-h-0 lg:items-start lg:pb-6"
    >
      <div data-testid="install-content" className="flex w-full flex-1 flex-col gap-6 lg:gap-10 lg:flex-none">
        <Molecules.InstallHeader />
        <Molecules.InstallCard />
        <Molecules.InstallFooter />
      </div>
      <div className="onboarding-nav mt-auto w-full lg:mt-0">
        <Molecules.InstallNavigation />
      </div>
    </Atoms.Container>
  );
}
