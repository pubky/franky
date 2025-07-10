'use client';

import { ReactNode, useState } from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  variant?: 'info' | 'warning' | 'success' | 'amber';
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
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

export function InfoCard({
  title,
  icon: Icon,
  variant = 'info',
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false,
}: InfoCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const styles = variantStyles[variant];

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      className={`${styles.container} rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-3 ${className} ${
        collapsible ? 'transition-all duration-200' : ''
      }`}
    >
      <div className={`${styles.icon} mt-0.5 flex-shrink-0`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`flex items-center justify-between ${collapsible ? 'cursor-pointer' : ''}`}
          onClick={toggleCollapse}
        >
          <p className="text-sm font-medium text-foreground mb-1">{title}</p>
          {collapsible && (
            <div className={`${styles.icon} ml-2 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>
              <ChevronRight className="h-4 w-4" />
            </div>
          )}
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            collapsible && isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
          }`}
        >
          <div className="text-xs sm:text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
