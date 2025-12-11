import * as Molecules from '@/molecules';

export function Scan(): React.ReactElement {
  return (
    <Molecules.OnboardingLayout testId="scan-page-content" navigation={<Molecules.ScanNavigation />}>
      <Molecules.ScanContent />
      <Molecules.ScanFooter />
    </Molecules.OnboardingLayout>
  );
}
