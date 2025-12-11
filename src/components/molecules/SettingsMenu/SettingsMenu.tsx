'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import { SETTINGS_MENU_ITEMS } from './SettingsMenu.constants';
import type { SettingsMenuProps } from './SettingsMenu.types';

export { SETTINGS_MENU_ITEMS } from './SettingsMenu.constants';
export type { SettingsMenuItem, SettingsMenuProps } from './SettingsMenu.types';

export function SettingsMenu({ className }: SettingsMenuProps): React.ReactElement {
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
