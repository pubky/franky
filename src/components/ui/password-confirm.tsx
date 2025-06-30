'use client';

import { PasswordInput } from './password-input';
import { CheckCircle2, X } from 'lucide-react';

interface PasswordConfirmProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  originalPassword: string;
  className?: string;
}

export function PasswordConfirm({
  label = 'Confirm your password',
  placeholder = 'Re-enter your password',
  value,
  onChange,
  originalPassword,
  className = '',
}: PasswordConfirmProps) {
  const isMatching = originalPassword === value;
  const hasValue = value.length > 0;
  const hasOriginalPassword = originalPassword.length > 0;

  return (
    <div className={className}>
      <PasswordInput
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        showStrengthMeter={false}
      />

      {hasValue && hasOriginalPassword && (
        <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-muted/30">
          {isMatching ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">Passwords match</span>
            </>
          ) : (
            <>
              <X className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-600">Passwords don&apos;t match</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
