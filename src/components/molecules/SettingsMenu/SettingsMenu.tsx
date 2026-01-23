'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { SETTINGS_ROUTES } from '@/app';

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  { icon: Libs.UserRound, label: 'Account', path: SETTINGS_ROUTES.ACCOUNT },
  { icon: Libs.Bell, label: 'Notifications', path: SETTINGS_ROUTES.NOTIFICATIONS },
  { icon: Libs.Shield, label: 'Privacy & Safety', path: SETTINGS_ROUTES.PRIVACY_SAFETY },
  { icon: Libs.VolumeX, label: 'Muted Users', path: SETTINGS_ROUTES.MUTED_USERS },
  { icon: Libs.Globe, label: 'Language', path: SETTINGS_ROUTES.LANGUAGE },
  { icon: Libs.CircleHelp, label: 'Help', path: SETTINGS_ROUTES.HELP },
];

export interface SettingsMenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
}

export interface SettingsMenuProps {
  className?: string;
}

export function SettingsMenu({ className }: SettingsMenuProps) {
  const pathname = usePathname();

  return (
    <Atoms.FilterRoot className={className}>
      <Atoms.FilterHeader title="Settings" />

      <Atoms.FilterList>
        {SETTINGS_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path;
          return (
            <Link key={item.label} href={item.path}>
              <Atoms.FilterItem isSelected={isSelected} onClick={() => {}}>
                <Atoms.FilterItemIcon icon={Icon} />
                <Atoms.FilterItemLabel>{item.label}</Atoms.FilterItemLabel>
              </Atoms.FilterItem>
            </Link>
          );
        })}
      </Atoms.FilterList>
    </Atoms.FilterRoot>
  );
}
