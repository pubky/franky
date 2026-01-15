'use client';

import { Controller, FieldValues } from 'react-hook-form';
import * as Atoms from '@/atoms';
import * as Molecules from '@/molecules';
import type { ControlledInputFieldProps } from './ControlledInputField.types';

const LABEL_CLASSES = 'text-xs font-medium tracking-wide text-muted-foreground uppercase';

export function ControlledInputField<T extends FieldValues>({
  name,
  control,
  label,
  labelHint,
  placeholder,
  maxLength,
  variant = 'dashed',
  size = 'lg',
  icon,
  iconPosition,
  disabled = false,
}: ControlledInputFieldProps<T>) {
  return (
    <Atoms.Container className="gap-2">
      <Atoms.Label htmlFor={name} className={LABEL_CLASSES}>
        {label}
        {labelHint}
      </Atoms.Label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Molecules.InputField
            id={name}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            maxLength={maxLength}
            placeholder={placeholder}
            variant={variant}
            size={size}
            icon={icon}
            iconPosition={iconPosition}
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
