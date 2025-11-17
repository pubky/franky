import * as Atoms from '@/components/atoms';
import * as Icons from '@/libs/icons';

export interface StatusPickerProps {
  emoji: string;
  status: string;
  onClick?: () => void;
}

export function StatusPicker({ emoji, status, onClick }: StatusPickerProps) {
  return (
    <Atoms.Button variant="ghost" size="sm" onClick={onClick} className="gap-1 px-0 shadow-none hover:bg-transparent">
      <Atoms.Typography as="span" className="text-base leading-none">
        {emoji}
      </Atoms.Typography>
      <Atoms.Typography as="span" className="text-base font-bold text-white">
        {status}
      </Atoms.Typography>
      <Icons.ChevronDown className="size-6" />
    </Atoms.Button>
  );
}
