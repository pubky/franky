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
  { icon: Libs.User, label: 'Account', path: SETTINGS_ROUTES.ACCOUNT },
  { icon: Libs.Bell, label: 'Notifications', path: SETTINGS_ROUTES.NOTIFICATIONS },
  { icon: Libs.ShieldCheck, label: 'Privacy & Safety', path: SETTINGS_ROUTES.PRIVACY_SAFETY },
  { icon: Libs.VolumeX, label: 'Muted Users', path: SETTINGS_ROUTES.MUTED_USERS },
  { icon: Libs.Languages, label: 'Language', path: SETTINGS_ROUTES.LANGUAGE },
  { icon: Libs.HelpCircle, label: 'Help', path: SETTINGS_ROUTES.HELP },
];

export interface SettingsMobileMenuProps {
  className?: string;
}

export function SettingsMobileMenu({ className }: SettingsMobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className={Libs.cn('flex gap-3 w-full justify-between', className)}>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isSelected = pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={Libs.cn(
              'border-b border-white/20 w-full pb-3 justify-center items-center inline-flex transition-all',
              'hover:bg-white/10 hover:border-white/30',
              isSelected ? 'opacity-100 border-white/100' : 'opacity-60',
            )}
            aria-label={item.label}
            aria-current={isSelected ? 'page' : undefined}
          >
            <Icon size={24} className="shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
