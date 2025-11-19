'use client';

import { usePathname, useRouter } from 'next/navigation';
import * as Libs from '@/libs';
import { SETTINGS_MENU_ITEMS } from '@/molecules/SettingsMenu/SettingsMenu';
import * as Atoms from '@/atoms';

export interface SettingsMobileMenuProps {
  className?: string;
}

export function SettingsMobileMenu({ className }: SettingsMobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Atoms.Container
      overrideDefaults
      data-testid="settings-mobile-menu"
      className={Libs.cn(
        'fixed top-[73px] right-0 left-0 z-(--z-sticky-header) border-b border-[var(--base-border,#303034)] bg-background/80 backdrop-blur-sm',
        className,
      )}
    >
      <Atoms.Container overrideDefaults className="flex w-full">
        {SETTINGS_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path;

          return (
            <Atoms.Button
              overrideDefaults
              key={item.path}
              onClick={() => router.push(item.path)}
              className={Libs.cn(
                'relative flex flex-1 items-center justify-center gap-2 px-2.5 py-3.5 transition-all',
                'hover:bg-secondary/10',
                isSelected
                  ? 'border-b border-white text-foreground'
                  : 'border-b border-transparent text-muted-foreground',
              )}
              aria-label={item.label}
              aria-current={isSelected ? 'page' : undefined}
            >
              <Icon size={20} className="shrink-0" />
            </Atoms.Button>
          );
        })}
      </Atoms.Container>
    </Atoms.Container>
  );
}
