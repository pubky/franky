import { ReactNode } from 'react';
import { Input } from '@/components/ui';
import { cn } from '@/libs';

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
      ? 'flex items-center gap-1 rounded-md border border-dashed border-brand bg-transparent pl-4.5 w-full'
      : 'flex items-center gap-1 w-full';

  const inputClasses =
    variant === 'dashed'
      ? 'cursor-pointer text-base font-medium text-brand !bg-transparent w-full h-12 border-none'
      : 'w-full';

  return (
    <div className={cn('w-full flex sm:max-w-[576px]', className)}>
      <div className={containerClasses}>
        {loading && loadingIcon}
        {!loading && icon}
        <Input
          className={inputClasses}
          value={loading ? loadingText : value}
          placeholder={placeholder}
          disabled={disabled || loading}
          readOnly={readOnly}
          onClick={onClick}
        />
      </div>
    </div>
  );
}
