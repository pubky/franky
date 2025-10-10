'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import { SETTINGS_MENU_ITEMS } from '../settings.config';

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
