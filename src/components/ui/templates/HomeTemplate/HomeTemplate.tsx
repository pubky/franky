import {
  HeaderOrganism,
  TitleHomeOrganism,
  FooterHomeOrganism,
  ActionHomeOrganism,
  SubtitleHomeOrganism,
  HomeOrganism,
  BackgroundHomeOrganism,
} from '@/components/ui';

export function HomeTemplate() {
  return (
    <>
      <BackgroundHomeOrganism />
      <>
        <HeaderOrganism />
        <HomeOrganism>
          <TitleHomeOrganism />
          <SubtitleHomeOrganism />
          <ActionHomeOrganism />
          <FooterHomeOrganism />
        </HomeOrganism>
      </>
    </>
  );
}
