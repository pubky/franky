import { HeaderOrganism } from '@/components/ui';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderOrganism />
      {children}
    </>
  );
}
