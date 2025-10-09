'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import { SETTINGS_ROUTES } from '@/app';

export interface SettingsMenuProps {
  className?: string;
}

export function SettingsMenu({ className }: SettingsMenuProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: Libs.User, label: 'Account', href: SETTINGS_ROUTES.ACCOUNT },
    { icon: Libs.Bell, label: 'Notifications', href: SETTINGS_ROUTES.NOTIFICATIONS },
    { icon: Libs.ShieldCheck, label: 'Privacy & Safety', href: SETTINGS_ROUTES.PRIVACY_SAFETY },
    { icon: Libs.VolumeX, label: 'Muted Users', href: SETTINGS_ROUTES.MUTED_USERS },
    { icon: Libs.Languages, label: 'Language', href: SETTINGS_ROUTES.LANGUAGE },
    { icon: Libs.HelpCircle, label: 'Help', href: SETTINGS_ROUTES.HELP },
  ];

  return (
    <Atoms.FilterRoot className={className}>
      <Atoms.FilterHeader title="Settings" />

      <Atoms.FilterList>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.href;
          return (
            <Link key={item.label} href={item.href}>
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
