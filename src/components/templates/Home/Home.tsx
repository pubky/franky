import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Home() {
  return (
    <>
      <Atoms.ImageBackground className="opacity-10 lg:opacity-100" image="/images/bg-home.svg" />
      <Atoms.Container size="container" className="px-6">
        <Molecules.PageContainer size="narrow" className="items-start mx-0 flex flex-col gap-6">
          <Molecules.HomePageHeading />
          <Molecules.HomeSectionTitle />
          <Molecules.HomeActions />
          <Molecules.HomeFooter />
        </Molecules.PageContainer>
      </Atoms.Container>
    </>
  );
}
