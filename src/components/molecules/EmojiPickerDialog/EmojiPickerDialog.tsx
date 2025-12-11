'use client';

import * as Atoms from '@/components/atoms';
import * as Molecules from '@/components/molecules';

export interface EmojiPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmojiSelect: Molecules.EmojiPickerProps['onEmojiSelect'];
  maxLength?: number;
  currentInput?: string;
}

export function EmojiPickerDialog({
  open,
  onOpenChange,
  onEmojiSelect,
  maxLength,
  currentInput,
}: EmojiPickerDialogProps): React.ReactElement {
  const handleEmojiSelect = (emoji: { native: string }): void => {
    onEmojiSelect(emoji);
    onOpenChange(false);
  };

  return (
    <Atoms.Dialog open={open} onOpenChange={onOpenChange}>
      <Atoms.DialogContent
        className="max-w-sm overflow-hidden p-0 sm:p-0"
        showCloseButton={false}
        hiddenTitle="Emoji Picker"
      >
        <Atoms.DialogDescription className="sr-only">Select an emoji</Atoms.DialogDescription>
        <Atoms.Container overrideDefaults={true} className="flex justify-center overflow-hidden">
          <Atoms.Container overrideDefaults={true} className="w-full max-w-full overflow-hidden">
            <Molecules.EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              maxLength={maxLength}
              currentInput={currentInput}
            />
          </Atoms.Container>
        </Atoms.Container>
      </Atoms.DialogContent>
    </Atoms.Dialog>
  );
}
