import { LucideIcon } from 'lucide-react';
import * as Libs from '@/libs';

export interface SidebarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

// Separate interface for div props when asChild is true
interface SidebarButtonDivProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  asChild: true;
}

export function SidebarButton(props: SidebarButtonProps | SidebarButtonDivProps) {
  const { icon: Icon, children, className, asChild, ...restProps } = props;

  const buttonContent = (
    <>
      <Icon className="h-4 w-4" />
      <span className="text-xs leading-normal font-bold text-[var(--base-foreground,#FFF)]">{children}</span>
    </>
  );

  if (asChild) {
    // For asChild, we use div props (excluding button-specific props)
    const divProps = restProps as Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>;
    return (
      <div
        className={Libs.cn(
          'flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-white/5 px-4 py-2 transition-colors hover:bg-white/10',
          className,
        )}
        {...divProps}
      >
        {buttonContent}
      </div>
    );
  }

  // For button, we use button props including onClick
  const buttonProps = restProps as Omit<SidebarButtonProps, 'icon' | 'children' | 'className' | 'asChild'>;

  return (
    <button
      className={Libs.cn(
        'flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-white/5 px-4 py-2 transition-colors hover:bg-white/10',
        className,
      )}
      {...buttonProps}
    >
      {buttonContent}
    </button>
  );
}
