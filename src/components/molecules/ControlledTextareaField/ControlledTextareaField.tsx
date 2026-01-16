'use client';

import { Controller, FieldValues } from 'react-hook-form';
import * as Config from '@/config';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { ControlledTextareaFieldProps } from './ControlledTextareaField.types';

const LABEL_CLASSES = 'text-xs font-medium tracking-wide text-muted-foreground uppercase';

export function ControlledTextareaField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  maxLength,
  variant = 'dashed',
  rows = Config.DEFAULT_TEXTAREA_ROWS,
  disabled = false,
}: ControlledTextareaFieldProps<T>) {
  return (
    <Atoms.Container className="gap-2">
      <Atoms.Label htmlFor={name} className={LABEL_CLASSES}>
        {label}
      </Atoms.Label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Molecules.TextareaField
            id={name}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            variant={variant}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            status={fieldState.error ? 'error' : 'default'}
            message={fieldState.error?.message}
            messageType={fieldState.error ? 'error' : 'default'}
          />
        )}
      />
    </Atoms.Container>
  );
}
