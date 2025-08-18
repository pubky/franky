import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

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
  status?: 'default' | 'success' | 'error';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
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
  status = 'default',
  onChange,
  maxLength,
}: InputFieldProps) {
  const containerClasses = variant === 'dashed' && 'border-dashed';

  const statusClasses = {
    default: '',
    success: 'border-brand text-brand',
    error: 'border-red-500 text-red-500',
  };

  return (
    <Atoms.Container
      className={Libs.cn(
        'cursor-pointer w-full h-12 mx-0 mb-2 items-center flex-row border bg-transparent gap-0 rounded-md',
        icon ? 'pl-4.5' : 'pl-2',
        containerClasses,
        statusClasses[status],
        loading && 'text-brand border-brand',
        className,
      )}
    >
      {loading && (
        <Atoms.Container className="justify-center items-center w-auto">
          {loadingIcon ?? (
            <Loader2 className="h-4 w-4 text-brand animate-spin linear infinite" data-testid="loading-icon" />
          )}
        </Atoms.Container>
      )}
      {!loading && icon && (
        <Atoms.Container onClick={onClick} className="w-auto justify-center items-center">
          {icon}
        </Atoms.Container>
      )}
      <Atoms.Input
        type="text"
        className={Libs.cn('w-full !bg-transparent border-none')}
        value={loading ? loadingText : value}
        placeholder={placeholder}
        disabled={disabled || loading}
        readOnly={readOnly}
        onClick={onClick}
        onChange={onChange}
        maxLength={maxLength}
      />
    </Atoms.Container>
  );
}
