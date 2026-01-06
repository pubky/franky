'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';
import type { SettingsSectionCardProps } from './SettingsSectionCard.types';

export function SettingsSectionCard({ icon: Icon, title, description, children, className }: SettingsSectionCardProps) {
  return (
    <Atoms.Container
      overrideDefaults
      className={Libs.cn(
        'inline-flex flex-col items-start justify-start gap-12 rounded-md bg-[#1D1D20] p-8 md:p-12',
        className,
      )}
    >
      <Atoms.Container overrideDefaults className="flex w-full flex-col items-start justify-start gap-3">
        {Icon && title && (
          <Atoms.Container overrideDefaults className="inline-flex items-center justify-start gap-2">
            <Icon size={24} />
            <Atoms.Heading level={2} size="lg" className="leading-8">
              {title}
            </Atoms.Heading>
          </Atoms.Container>
        )}
        {description && (
          <Atoms.Typography
            as="p"
            size="md"
            overrideDefaults
            className="text-base leading-6 font-medium text-secondary-foreground"
          >
            {description}
          </Atoms.Typography>
        )}
        {children}
      </Atoms.Container>
    </Atoms.Container>
  );
}
