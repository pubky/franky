import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Organisms from '@/organisms';
import type { RightSidebarProps } from './RightSidebar.types';

export function RightSidebar({ className }: RightSidebarProps) {
  return (
    <Atoms.Container
      overrideDefaults
      data-testid="right-sidebar"
      className={Libs.cn('hidden w-(--filter-bar-width) flex-col items-start justify-start gap-6 lg:flex', className)}
    >
      <Organisms.WhoToFollow />
      <Organisms.ActiveUsers />
      <Atoms.Container overrideDefaults className="sticky top-[100px] self-start">
        <Organisms.FeedbackCard />
      </Atoms.Container>
    </Atoms.Container>
  );
}
