'use client';

import { usePathname, useRouter } from 'next/navigation';
import * as Libs from '@/libs';
import { SETTINGS_MENU_ITEMS } from '@/molecules/SettingsMenu/SettingsMenu';

export interface SettingsMobileMenuProps {
  className?: string;
}

export function SettingsMobileMenu({ className }: SettingsMobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={Libs.cn(
        'fixed top-[73px] left-0 right-0 z-20 bg-background/80 backdrop-blur-sm border-b border-[var(--base-border,#303034)]',
        className,
      )}
    >
      <div className="flex w-full">
        {SETTINGS_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={Libs.cn(
                'flex flex-1 justify-center items-center gap-2 px-2.5 py-3.5 transition-all relative',
                'hover:bg-secondary/10',
                isSelected
                  ? 'text-foreground border-b border-white'
                  : 'text-muted-foreground border-b border-transparent',
              )}
              aria-label={item.label}
              aria-current={isSelected ? 'page' : undefined}
            >
              <Icon size={20} className="shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
