'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface SettingsSwitchItemProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function SettingsSwitchItem({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
  className,
}: SettingsSwitchItemProps) {
  return (
    <div className={Libs.cn('flex w-full items-start justify-between gap-3', className)}>
      <div className="flex flex-col items-start gap-2">
        <Atoms.Typography as="label" htmlFor={id} size="sm" className="pt-[3px] leading-none font-medium">
          {label}
        </Atoms.Typography>
        {description && (
          <Atoms.Typography size="sm" className="font-normal text-muted-foreground">
            {description}
          </Atoms.Typography>
        )}
      </div>
      <Atoms.Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
