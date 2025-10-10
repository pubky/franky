import { LucideIcon } from 'lucide-react';
import * as Libs from '@/libs';

export interface SidebarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function SidebarButton({ icon: Icon, children, onClick, className, ...props }: SidebarButtonProps) {
  return (
    <button
      className={Libs.cn(
        'w-full flex items-center justify-center gap-2 py-2 px-4 rounded-full border border-border hover:border-opacity-30 cursor-pointer transition-colors',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs font-bold leading-normal text-[var(--base-foreground,#FFF)]">{children}</span>
    </button>
  );
}
