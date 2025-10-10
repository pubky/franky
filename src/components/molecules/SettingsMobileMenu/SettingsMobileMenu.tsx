'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface SettingsMobileMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
}

export interface SettingsMobileMenuProps {
  className?: string;
  'data-testid'?: string;
}

export function SettingsMobileMenu({ className, 'data-testid': dataTestId }: SettingsMobileMenuProps) {
  const menuItems: SettingsMobileMenuItem[] = [
    { id: 'account', icon: Libs.User, label: 'Account', href: '#' },
    { id: 'notifications', icon: Libs.Bell, label: 'Notifications', href: '#' },
    { id: 'privacy', icon: Libs.ShieldCheck, label: 'Privacy', href: '#' },
    { id: 'muted', icon: Libs.UserX, label: 'Muted', href: '#' },
    { id: 'language', icon: Libs.Languages, label: 'Language', href: '#' },
    { id: 'help', icon: Libs.HelpCircle, label: 'Help', href: '#' },
  ];

  return (
    <div
      className={Libs.cn(
        'w-full lg:hidden overflow-x-auto bg-background/95 backdrop-blur-sm border-b border-border',
        className,
      )}
      data-testid={dataTestId || 'settings-mobile-menu'}
    >
      <div className="flex gap-4 min-w-max px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const handleClick = () => {
            if (item.onClick) {
              item.onClick();
            }
          };

          return (
            <button
              key={item.id}
              onClick={handleClick}
              className="flex flex-col items-center gap-2 min-w-[60px] px-2 py-2 transition-opacity opacity-50 hover:opacity-100"
              data-testid={`settings-mobile-menu-${item.id}`}
            >
              <Icon className="w-5 h-5" />
              <Atoms.Typography size="sm" className="text-xs text-center">
                {item.label}
              </Atoms.Typography>
            </button>
          );
        })}
      </div>
    </div>
  );
}
