import { ReactNode } from 'react';

interface ResponsiveSectionProps {
  desktop?: ReactNode;
  mobile?: ReactNode;
  className?: string;
  desktopClassName?: string;
  mobileClassName?: string;
}

export function ResponsiveSection({
  desktop,
  mobile,
  className,
  desktopClassName = 'hidden md:flex flex-col gap-6',
  mobileClassName = 'flex md:hidden flex-col gap-6',
}: ResponsiveSectionProps) {
  return (
    <div className={className}>
      {desktop && <div className={desktopClassName}>{desktop}</div>}
      {mobile && <div className={mobileClassName}>{mobile}</div>}
    </div>
  );
}
