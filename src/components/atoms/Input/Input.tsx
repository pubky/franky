import * as React from 'react';

import * as Libs from '@/libs';

type InputTheme = 'default' | 'outline';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: React.HTMLAttributes<HTMLInputElement>['className'];
  theme?: InputTheme;
}

const defaultProps = {
  type: 'text',
  theme: 'default',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ ...props }, ref) => {
  const { theme } = { ...defaultProps, ...props };

  const inputClassName = Libs.cn(
    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    'aria-invalid:ring-destructive/20 aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus:outline-none hover:outline-none hover:ring-0 focus:ring-0 focus:ring-offset-0',
    theme === 'outline' && 'border-input',
    props.className,
  );

  return <input ref={ref} data-testid="input" {...props} className={inputClassName} />;
}) as React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

Input.displayName = 'Input';
