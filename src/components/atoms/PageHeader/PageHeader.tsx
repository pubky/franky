import * as Libs from '@/libs';
import * as Atoms from '@/atoms';

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function PageHeader({
  children,
  className,
  'data-testid': dataTestId,
  ...props
}: PageHeaderProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Atoms.Container
      className={Libs.cn('gap-3', className)}
      data-testid={dataTestId || 'container'}
      {...(props as React.ComponentProps<typeof Atoms.Container>)}
    >
      {children}
    </Atoms.Container>
  );
}
