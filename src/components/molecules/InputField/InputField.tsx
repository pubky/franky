import { ReactNode } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface InputFieldProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  variant?: 'default' | 'dashed';
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: ReactNode;
}

export function InputField({
  value,
  placeholder,
  disabled = false,
  readOnly = false,
  onClick,
  className,
  icon,
  variant = 'default',
  loading = false,
  loadingText = 'Loading...',
  loadingIcon,
}: InputFieldProps) {
  const containerClasses =
    variant === 'dashed'
      ? 'flex-row items-center gap-3 rounded-md border border-dashed border-brand bg-transparent pl-4.5'
      : 'items-center gap-1';

  const inputClasses =
    variant === 'dashed'
      ? 'cursor-pointer text-base font-medium text-brand !bg-transparent h-12 border-none text-left'
      : 'w-full';

  return (
    <Atoms.Container className={Libs.cn('w-full max-w-[576px] mx-0 mb-2 items-center', containerClasses, className)}>
      {loading && loadingIcon && <div className="flex items-center justify-center">{loadingIcon}</div>}
      {!loading && icon && <div className="flex items-center justify-center">{icon}</div>}
      <Atoms.Input
        type="text"
        className={Libs.cn('w-full', inputClasses)}
        value={loading ? loadingText : value}
        placeholder={placeholder}
        disabled={disabled || loading}
        readOnly={readOnly}
        onClick={onClick}
      />
    </Atoms.Container>
  );
}
