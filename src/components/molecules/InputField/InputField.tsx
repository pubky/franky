import { ReactNode } from 'react';

import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface InputFieldProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
  onClickIcon?: () => void;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  icon?: ReactNode;
  variant?: 'default' | 'dashed';
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: ReactNode;
  status?: 'default' | 'success' | 'error';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  iconPosition?: 'left' | 'right';
  message?: ReactNode;
  messageType?: 'default' | 'info' | 'alert' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function InputField({
  value,
  placeholder,
  disabled = false,
  readOnly = false,
  onClick,
  onClickIcon = () => {},
  className,
  icon,
  variant = 'default',
  loading = false,
  loadingText = 'Loading...',
  loadingIcon,
  status = 'default',
  onChange,
  maxLength,
  iconPosition = 'left',
  message,
  messageType = 'default',
  size = 'md',
}: InputFieldProps) {
  const containerClasses = variant === 'dashed' && 'border-dashed';

  const statusClasses = {
    default: '',
    success: 'border-brand text-brand',
    error: 'border-red-500 text-red-500',
  };

  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg',
  } as const;

  const messageClasses = {
    default: 'text-muted-foreground',
    info: 'text-blue-500',
    alert: 'text-yellow-500',
    error: 'text-red-500',
    success: 'text-brand',
  } as const;

  return (
    <>
      <Atoms.Container
        className={Libs.cn(
          'cursor-pointer w-full mx-0 mb-2 items-center flex-row border gap-0 rounded-md !bg-alpha-90/10 bg-transparent',
          icon && iconPosition === 'left' ? 'pl-4.5' : 'pl-2',
          containerClasses,
          statusClasses[status],
          loading && 'text-brand border-brand',
          sizeClasses[size],
          className,
        )}
      >
        {loading && (
          <Atoms.Container className="justify-center items-center w-auto">
            {loadingIcon ?? (
              <Libs.Loader2 className="h-4 w-4 text-brand animate-spin linear infinite" data-testid="loading-icon" />
            )}
          </Atoms.Container>
        )}
        {!loading && icon && iconPosition === 'left' && (
          <Atoms.Container
            onClick={onClickIcon}
            className={Libs.cn('w-auto justify-center items-center cursor-pointer')}
          >
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
          aria-invalid={status === 'error'}
        />
        {!loading && icon && iconPosition === 'right' && (
          <Atoms.Container
            onClick={onClickIcon}
            className={Libs.cn('w-auto justify-center items-center cursor-pointer mr-5')}
          >
            {icon}
          </Atoms.Container>
        )}
      </Atoms.Container>
      {message && (
        <Atoms.Typography as="small" size="sm" className={Libs.cn('ml-1', messageClasses[messageType])}>
          {message}
        </Atoms.Typography>
      )}
    </>
  );
}
