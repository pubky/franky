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
          <Atoms.DialogDescription>Are you sure? Your account information cannot be recovered.</Atoms.DialogDescription>
        </Atoms.DialogHeader>

        <Atoms.DialogFooter>
          <Atoms.Button
            variant="dialog"
            size="dialog"
            onClick={handleCancel}
            className="w-full sm:flex-1 sm:w-0 text-foreground"
          >
            Cancel
          </Atoms.Button>
          <Atoms.Button
            variant="destructive"
            size="dialog"
            onClick={handleDeleteAccount}
            className="w-full sm:flex-1 sm:w-0"
          >
            <Libs.Trash2 className="h-4 w-4" />
            Delete Account
          </Atoms.Button>
        </Atoms.DialogFooter>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
