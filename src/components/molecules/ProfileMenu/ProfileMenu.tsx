'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import * as Atoms from '@/atoms';
import { PROFILE_MENU_ITEMS, getProfileCount, ProfileCounts } from './profileMenu.shared';

export interface ProfileMenuProps {
  className?: string;
  counts?: ProfileCounts;
}

export function ProfileMenu({ className, counts }: ProfileMenuProps) {
  const pathname = usePathname();

  const getCount = (label: string) => getProfileCount(label, counts);

  return (
    <Atoms.FilterRoot className={className}>
      <Atoms.FilterList>
        {PROFILE_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path;
          const count = getCount(item.label);
          return (
            <Link key={item.label} href={item.path}>
              <Atoms.FilterItem isSelected={isSelected} onClick={() => {}}>
                <Atoms.FilterItemIcon icon={Icon} />
                <Atoms.FilterItemLabel>
                  {item.label}
                  {count !== undefined && ` (${count})`}
                </Atoms.FilterItemLabel>
              </Atoms.FilterItem>
            </Link>
          );
        })}
      </Atoms.FilterList>
    </Atoms.FilterRoot>
  );
}
