'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface ProfileTabMobile {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  count?: number | null;
  onClick?: () => void;
}

export interface ProfileTabsMobileProps {
  tabs: ProfileTabMobile[];
  activeTab?: string;
  className?: string;
  'data-testid'?: string;
}

export function ProfileTabsMobile({ tabs, activeTab, className, 'data-testid': dataTestId }: ProfileTabsMobileProps) {
  return (
    <div
      className={Libs.cn('w-full lg:hidden overflow-x-auto', className)}
      data-testid={dataTestId || 'profile-tabs-mobile'}
    >
      <div className="flex gap-4 min-w-max pb-4 border-b border-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={Libs.cn(
                'flex flex-col items-center gap-2 min-w-[60px] px-2 py-2 transition-opacity',
                isActive ? 'opacity-100' : 'opacity-50 hover:opacity-80',
              )}
              data-testid={`profile-tab-mobile-${tab.id}`}
            >
              <div className="flex items-center gap-1">
                {Icon && <Icon className="w-5 h-5" />}
                {tab.count !== undefined && tab.count !== null && (
                  <Atoms.Typography size="sm" className="font-bold">
                    {tab.count}
                  </Atoms.Typography>
                )}
              </div>
              <Atoms.Typography size="sm" className="text-xs text-center">
                {tab.label}
              </Atoms.Typography>
            </button>
          );
        })}
      </div>
    </div>
  );
}
