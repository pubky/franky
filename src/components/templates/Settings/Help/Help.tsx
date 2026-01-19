'use client';

import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import * as Libs from '@/libs';

export function Help() {
  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn('flex flex-col items-start gap-6 rounded-md bg-card p-8 md:p-12')}
    >
      <Molecules.HelpContent />
    </Atoms.Container>
  );
}
