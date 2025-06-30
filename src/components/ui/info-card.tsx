import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  variant?: 'info' | 'warning' | 'success' | 'amber';
  children: ReactNode;
  className?: string;
}

const variantStyles = {
  info: {
    container: 'bg-muted/50 border-l-4 border-l-blue-500/30',
    icon: 'text-blue-600',
  },
  warning: {
    container: 'bg-muted/50 border-l-4 border-l-orange-500/30',
    icon: 'text-orange-600',
  },
  success: {
    container: 'bg-muted/50 border-l-4 border-l-green-500/30',
    icon: 'text-green-600',
  },
  amber: {
    container: 'bg-muted/50 border-l-4 border-l-amber-500/30',
    icon: 'text-amber-600',
  },
} as const;

export function InfoCard({ title, icon: Icon, variant = 'info', children, className = '' }: InfoCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.container} rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-3 ${className}`}
    >
      <div className={`${styles.icon} mt-0.5 flex-shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground mb-1">{title}</p>
        <div className="text-xs sm:text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
