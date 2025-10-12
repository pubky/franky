'use client';

import * as React from 'react';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export interface SettingsSwitchItemProps {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function SettingsSwitchItem({ id, label, checked, disabled, onChange, className }: SettingsSwitchItemProps) {
  return (
    <div className={Libs.cn('w-full h-8 justify-between items-center inline-flex', className)}>
      <Atoms.Typography size="sm" className="font-semibold">
        {label}
      </Atoms.Typography>
      <Atoms.Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
