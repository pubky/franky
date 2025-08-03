import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export function StoreButtons({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Atoms.Container className={Libs.cn('flex-row gap-4 justify-around sm:justify-start', className)}>
      <Molecules.DialogDownloadPubkyRing store="apple" />
      <Molecules.DialogDownloadPubkyRing store="android" />
    </Atoms.Container>
  );
}
