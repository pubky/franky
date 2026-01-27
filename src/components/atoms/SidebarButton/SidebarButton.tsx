import * as Atoms from '@/atoms';
import type { SidebarButtonProps } from './SidebarButton.types';

export function SidebarButton({ icon: Icon, children, ...props }: SidebarButtonProps) {
  return (
    <Atoms.Button
      variant="dark-outline"
      size="sm"
      className="w-full border-border bg-white/5 text-xs font-bold"
      {...props}
    >
      <Icon className="size-4" />
      {children}
    </Atoms.Button>
  );
}
