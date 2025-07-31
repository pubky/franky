import {
  FooterInstallOrganism,
  InstallHeaderOrganism,
  MainInstallOrganism,
  InstallNavigationOrganism,
  InstallOrganism,
} from '@/components/ui';

export function InstallTemplate() {
  return (
    <InstallOrganism>
      <InstallHeaderOrganism />
      <MainInstallOrganism />
      <FooterInstallOrganism />
      <InstallNavigationOrganism />
    </InstallOrganism>
  );
}
