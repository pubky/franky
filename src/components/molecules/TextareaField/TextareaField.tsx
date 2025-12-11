import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

interface TextareaFieldProps {
  id?: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
  className?: React.HTMLAttributes<HTMLDivElement>['className'];
  variant?: 'default' | 'dashed';
  status?: 'default' | 'success' | 'error';
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
  rows?: number;
  maxRows?: number;
  message?: React.ReactNode;
  messageType?: 'default' | 'info' | 'alert' | 'error' | 'success';
}

export function TextareaField({
  id,
  value,
  placeholder,
  disabled = false,
  readOnly = false,
  onClick,
  className,
  variant = 'default',
  status = 'default',
  onChange,
  onKeyDown,
  maxLength,
  rows = 4,
  message,
  messageType = 'default',
}: TextareaFieldProps): React.ReactElement {
  const statusClasses = {
    default: '',
    success: 'border-brand text-brand',
    error: 'border-red-500 text-red-500',
  };

  const textAreaClasses = Libs.cn('break-all w-full border-none resize-none px-5 py-4 h-25 !bg-transparent');
  const containerClasses = Libs.cn(
    'flex-1 cursor-pointer w-full items-center flex-row border gap-0 rounded-md font-medium',
    variant === 'dashed' && 'border-dashed !bg-alpha-90/10',
  );
  const messageClasses = {
    default: 'text-muted-foreground',
    info: 'text-blue-500',
    alert: 'text-yellow-500',
    error: 'text-red-500',
    success: 'text-brand',
  } as const;

  return (
    <>
      <Atoms.Container className={Libs.cn(containerClasses, statusClasses[status], className)}>
        <Atoms.Textarea
          id={id}
          className={textAreaClasses}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onClick={onClick}
          onChange={onChange}
          onKeyDown={onKeyDown}
          maxLength={maxLength}
          rows={rows}
          aria-invalid={status === 'error'}
        />
      </Atoms.Container>
      {message && (
        <Atoms.Typography as="small" size="sm" className={Libs.cn('ml-1', messageClasses[messageType])}>
          {message}
        </Atoms.Typography>
      )}
    </>
  );
}
