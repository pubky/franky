import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Landing() {
  return (
    <>
      <Atoms.ImageBackground image="/images/bg-home.svg" mobileImage="/images/bg-home-mobile.svg" />
      <Atoms.Container size="container" className="px-6">
        <Molecules.PageContainer size="narrow" className="mx-0 flex flex-col items-start gap-6">
          <Molecules.HomePageHeading />
          <Molecules.HomeSectionTitle />
          <Molecules.HomeActions />
          <Molecules.HomeFooter />
        </Molecules.PageContainer>
      </Atoms.Container>
    </>
  );
}
