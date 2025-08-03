import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';

export function Home() {
  return (
    <>
      <Atoms.ImageBackground className="opacity-10 lg:opacity-100" image="/images/bg-home.svg" />
      <Atoms.Container size="container">
        <Molecules.PageContainer size="narrow" className="items-start justify-start mx-0 flex flex-col gap-6">
          <Molecules.HomePageHeading />
          <Molecules.HomeSectionTitle />
          <Molecules.HomeActions />
          <Molecules.HomeFooter className="h-26 pr-16 justify-end flex-row content-end" />
        </Molecules.PageContainer>
      </Atoms.Container>
    </>
  );
}
