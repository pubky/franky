import * as Molecules from '@/molecules';

export function Install(): React.ReactElement {
  return (
    <Molecules.OnboardingLayout testId="install-content" navigation={<Molecules.InstallNavigation />}>
      <Molecules.InstallHeader />
      <Molecules.InstallCard />
      <Molecules.InstallFooter />
    </Molecules.OnboardingLayout>
  );
}
