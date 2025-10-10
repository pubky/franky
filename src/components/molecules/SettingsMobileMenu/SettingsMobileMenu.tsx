'use client';

import { usePathname, useRouter } from 'next/navigation';
import * as Libs from '@/libs';
import { SETTINGS_ROUTES } from '@/app';

interface MenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: Libs.UserRound, label: 'Account', path: SETTINGS_ROUTES.ACCOUNT },
  { icon: Libs.Bell, label: 'Notifications', path: SETTINGS_ROUTES.NOTIFICATIONS },
  { icon: Libs.Shield, label: 'Privacy & Safety', path: SETTINGS_ROUTES.PRIVACY_SAFETY },
  { icon: Libs.MegaphoneOff, label: 'Muted Users', path: SETTINGS_ROUTES.MUTED_USERS },
  { icon: Libs.Globe, label: 'Language', path: SETTINGS_ROUTES.LANGUAGE },
  { icon: Libs.CircleHelp, label: 'Help', path: SETTINGS_ROUTES.HELP },
];

export interface SettingsMobileMenuProps {
  className?: string;
}

export function SettingsMobileMenu({ className }: SettingsMobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={Libs.cn('sticky top-20 z-20 bg-background border-b border-border/20', className)}>
      <div className="flex w-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={Libs.cn(
                'flex flex-1 justify-center items-center gap-2 py-1.5 transition-all relative',
                'hover:bg-secondary/10',
                isSelected ? 'text-foreground' : 'text-muted-foreground',
              )}
              style={{
                padding: 'var(--spacing-1-5, 6px) 0',
                gap: 'var(--spacing-2, 8px)',
                flex: '1 0 0',
              }}
              aria-label={item.label}
              aria-current={isSelected ? 'page' : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {isSelected && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
