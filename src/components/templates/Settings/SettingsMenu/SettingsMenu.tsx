'use client';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface SettingsMenuProps {
  className?: string;
}

export function SettingsMenu({ className }: SettingsMenuProps) {
  const menuItems = [
    { icon: Libs.User, label: 'Account', href: '#' },
    { icon: Libs.Bell, label: 'Notifications', href: '#' },
    { icon: Libs.ShieldCheck, label: 'Privacy and safety', href: '#' },
    { icon: Libs.UserX, label: 'Muted users', href: '#' },
    { icon: Libs.Languages, label: 'Language', href: '#' },
    { icon: Libs.HelpCircle, label: 'Help', href: '#' },
  ];

  return (
    <Atoms.FilterRoot className={className}>
      <Atoms.FilterHeader title="Settings" />

      <Atoms.FilterList>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Atoms.FilterItem key={item.label} isSelected={false} onClick={() => {}}>
              <Atoms.FilterItemIcon icon={Icon} />
              <Atoms.FilterItemLabel>{item.label}</Atoms.FilterItemLabel>
            </Atoms.FilterItem>
          );
        })}
      </Atoms.FilterList>
    </Atoms.FilterRoot>
  );
}
