import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Home() {
  return (
    <>
      <Atoms.ImageBackground className="opacity-10 lg:opacity-100" image="/images/bg-home.svg" />
      <Molecules.PageWrapper>
        <Molecules.HomePageHeading title="Unlock the web." />
        <Molecules.HomeSectionTitle />
        <Molecules.HomeActions />
        <Molecules.HomeFooter />
      </Molecules.PageWrapper>
    </>
  );
}
