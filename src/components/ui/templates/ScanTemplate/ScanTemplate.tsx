import { ScanNavigationOrganism, FooterScanOrganism, MainScanOrganism, ScanOrganism } from '@/components/ui';

export function ScanTemplate() {
  return (
    <ScanOrganism>
      <MainScanOrganism />
      <FooterScanOrganism />
      <ScanNavigationOrganism />
    </ScanOrganism>
  );
}
