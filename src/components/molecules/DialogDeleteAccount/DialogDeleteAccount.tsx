'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface DialogDeleteAccountProps {
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onDeleteAccount?: () => void;
}

export function DialogDeleteAccount({ isOpen, onOpenChangeAction }: DialogDeleteAccountProps) {
  const handleDeleteAccount = () => {
    onOpenChangeAction(false);
  };

  const handleCancel = () => {
    onOpenChangeAction(false);
  };

  return (
    <Atoms.Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
      <Atoms.DialogContent className="max-w-md sm:max-w-lg" hiddenTitle="Delete Account">
        <Atoms.DialogHeader>
          <Atoms.DialogTitle>Delete Account</Atoms.DialogTitle>
        </Atoms.DialogHeader>
        <Atoms.Typography className="text-muted-foreground text-lg font-normal leading-6 tracking-wide">
          Are you sure? Your account information cannot be recovered.
        </Atoms.Typography>
        <Atoms.DialogFooter>
          <Atoms.Button variant="dark" size="dialog" onClick={handleCancel}>
            Cancel
          </Atoms.Button>
          <Atoms.Button variant="destructive" size="dialog" onClick={handleDeleteAccount}>
            <Libs.Trash2 className="h-4 w-4" />
            Delete Account
          </Atoms.Button>
        </Atoms.DialogFooter>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
