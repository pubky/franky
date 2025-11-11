import * as Atoms from '@/components/atoms';
import * as Icons from '@/libs/icons';

export interface StatusPickerProps {
  emoji: string;
  status: string;
  onClick?: () => void;
}

export function StatusPicker({ emoji, status, onClick }: StatusPickerProps) {
  return (
    <Atoms.Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="px-0 gap-1 border-none shadow-none hover:bg-transparent"
    >
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-base font-bold text-white">{status}</span>
      <Icons.ChevronDown className="size-6" />
    </Atoms.Button>
  );
}
