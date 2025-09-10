import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import * as Molecules from '@/molecules';

export const AlertBackup = () => {
  return (
    <Atoms.Container className="px-6 py-3 bg-brand rounded-lg flex flex-row items-center gap-3">
      <Atoms.Container className="flex flex-row flex-1 gap-3 items-center">
        <Libs.TriangleAlert className="h-4 w-4 font-bold text-primary-foreground" />
        <Atoms.Typography size="sm" className="font-bold text-primary-foreground">
          Back up now to avoid losing your account!
        </Atoms.Typography>
      </Atoms.Container>
      <Molecules.DialogBackup />
      <Molecules.DialogConfirmBackup />
    </Atoms.Container>
  );
};
