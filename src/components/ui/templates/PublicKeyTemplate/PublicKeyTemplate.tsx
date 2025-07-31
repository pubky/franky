import {
  PublicKeyHeaderOrganism,
  PublicKeyNavigationOrganism,
  MainPublicKeyOrganism,
  PublicKeyOrganism,
} from '@/components/ui';

export function PublicKeyTemplate() {
  return (
    <PublicKeyOrganism>
      <PublicKeyHeaderOrganism />
      <MainPublicKeyOrganism />
      <PublicKeyNavigationOrganism />
    </PublicKeyOrganism>
  );
}
