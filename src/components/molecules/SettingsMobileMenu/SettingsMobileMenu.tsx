'use client';

import { usePathname, useRouter } from 'next/navigation';
import * as Libs from '@/libs';
import { SETTINGS_MENU_ITEMS } from '@/molecules/SettingsMenu/SettingsMenu';
import * as Atoms from '@/atoms';

export interface SettingsMobileMenuProps {
  className?: string;
}

/**
 * Mobile settings navigation menu.
 * Follows same pattern as ProfilePageMobileMenu.
 * Uses --header-height-mobile CSS var for consistent positioning.
 */
export function SettingsMobileMenu({ className }: SettingsMobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Atoms.Container
      overrideDefaults
      data-testid="settings-mobile-menu"
      className={Libs.cn(
        'fixed top-(--header-height-mobile) right-0 left-0 z-(--z-sticky-header) bg-background shadow-xl',
        className,
      )}
    >
      <Atoms.Container overrideDefaults className="flex w-full">
        {SETTINGS_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path;

          return (
            <Atoms.Container
              key={item.path}
              overrideDefaults
              className={Libs.cn(
                'flex flex-1 justify-center border-b px-0 py-1.5',
                isSelected ? 'border-foreground' : 'border-border',
              )}
            >
              <Atoms.Button
                overrideDefaults
                onClick={() => router.push(item.path)}
                className="px-2.5 py-2"
                aria-label={item.label}
                aria-current={isSelected ? 'page' : undefined}
              >
                <Icon size={20} className={isSelected ? 'text-foreground' : 'text-muted-foreground'} />
              </Atoms.Button>
            </Atoms.Container>
          );
        })}
      </Atoms.Container>
    </Atoms.Container>
  );
}
